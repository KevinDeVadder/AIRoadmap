const parseArgs = require('minimist');
const io = require('socket.io')();
const tf = require('@tensorflow/tfjs-node');

const { model: modelDir = 'model', speed: maxSpeed = 30 } = parseArgs(
  process.argv.slice(2)
);

//Load model
tf.loadLayersModel(`file://${modelDir}/model.json`).then((model) => {
  console.log("Model loaded")
  io.on('connection', async (socket) => {
    console.log('Simulator connected');

    socket.on('telemetry', (telemetry) => {
      if (!telemetry) return;

      const imageBuffer = Buffer.from(telemetry.image, 'base64');
      const imageTensor = tf.node
        .decodeJpeg(imageBuffer)
        .div(255)
        .reshape([1, 160, 320, 3]);
      const steering = model.predict(imageTensor).squeeze().arraySync();

      const throttle = 1 - telemetry.speed / maxSpeed;

      socket.emit('steer', {
        steering_angle: String(steering),
        throttle: String(throttle)
      });
    });
  });

  io.listen(4567);
});