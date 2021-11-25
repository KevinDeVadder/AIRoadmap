const tf = require('@tensorflow/tfjs-node')
const csv = require('csv-parser')
const fs = require('fs')
const path = require('path')
const linesCount = require('file-lines-count')
const parseArgs = require('minimist')

//Add Command line Args
const {
    data: dataDir = 'data',
    model: modelDir = 'model',
    epochs = 10
} = parseArgs(process.argv.slice(2));

const pathToCSV = path.join(dataDir, 'driving_log.csv');

async function* dataGenerator() {
    while (true) {
      //Read driving Log
      const csvStream = fs.createReadStream(pathToCSV).pipe(csv({
        headers: ['center', 'left', 'right', 'steering', 'throttle', 'brake', 'speed'],
        mapValues: ({ value }) => value.trim()
      }));
  
      for await (const { center, left, right, steering } of csvStream) {
        const centerImageBuffer = fs.promises.readFile(center);
        const leftImageBuffer = fs.promises.readFile(left);
        const rightImageBuffer = fs.promises.readFile(right);
  
        const offset = 0.333;
  
        yield [await centerImageBuffer, Number(steering)];
        yield [await leftImageBuffer, Number(steering) + offset];
        yield [await rightImageBuffer, Number(steering) - offset];
      }
  
      csvStream.destroy();
    }
}

async function initModel(){
    let model

    try {
        model = await tf.loadLayersModel(`file://${modelDir}/model.json`)
        console.log(`Model loaded from: ${modelDir}`)
    } catch {
        //Create Model
        model = tf.sequential({
            layers: [
            // Cropping layer
            tf.layers.cropping2D({
                //Crop the top landscape and the car hood
                cropping: [[50, 25], [0, 0]],
                //Set input shape
                inputShape: [160, 320, 3]
            }),

            // 1st convolutional layer
            tf.layers.conv2d({
                filters: 16,
                kernelSize: [5, 5],
                strides: [1, 1],
                activation: 'relu'
            }),
        
            // 1st max-pooling layer
            //Max pooling keeps the most important information from the conv2d
            tf.layers.maxPool2d({ 
                poolSize: [2, 2] 
            }),

            // 2nd convolutional layer
            tf.layers.conv2d({
                filters: 32,
                kernelSize: [5, 5],
                strides: [1, 1],
                activation: 'relu'
            }),

            // 2nd max-pool layer
            tf.layers.maxPool2d({ 
                poolSize: [2, 2] 
            }),

            // Dense layers with dropout layer
            tf.layers.flatten(),
            tf.layers.dense({ units: 2048, activation: 'relu' }),
            tf.layers.dropout({ rate: 0.25 }),
            tf.layers.dense({ units: 256, activation: 'relu' }),

            //Output layer
            tf.layers.dense({ units: 1, activation: 'linear' })

            ]
        })
    }
    model.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError'
    })

    return model
}

(async function(){
    const batchSize = 64;
    const dataset = tf.data
    // Use our generator function
    .generator(dataGenerator)
    // Convert each datapoint to TensorFlow-specific representation
    .map(([imageBuffer, steering]) => {
        const xs = tf.node.decodeJpeg(imageBuffer).div(255);
        const ys = tf.tensor1d([steering]);
        return { xs, ys };
    })
    // Randomly shuffle data within batches of specific size
    .shuffle(batchSize)
    // Return datapoints in batches of specific size
    .batch(batchSize);

    // Initialize our model
    const model = await initModel();
    // Calulate total number of samples in our dataset
    const totalSamples = (await linesCount(pathToCSV)) * 3;
    // Train the model
    await model.fitDataset(dataset, {
        epochs,
        batchesPerEpoch: Math.floor(totalSamples / batchSize)
    });
    // Save the trained model
    await model.save(`file://${modelDir}`);
})();