For this project, I will be following the steps in the following article: https://levelup.gitconnected.com/run-a-self-driving-car-using-javascript-and-tensorflow-js-8b9b3f7af23d.
After succesfully completing the tutorial, I will build my own track in Unity, in order to test my knowledge.

Test 1 - Model made by using data from only the first track | Loss - 0.044 | Epochs - 10 | Works perfectly on the first track. It crashes on the second one after just 5 seconds.
Test 2 - Model made by training the first model with second track data | Loss - 0.154 | Epochs - 10 | Works perfectly on the first track. It crashes on the second one.
Test 3 - Model made by using data from the first track and the second track. I have also changed the number of filters + the number of units in the layers. | Loss - 0.121 | Epochs - 10 | Works perfectly on the first track. On the second track, it crashes into the fence. I believe it is because the car recognizes the lines in the fence and mistakes them for a road.
Test 4 - Model made by using data from the first track and the second track | Loss - 0.174 | Epochs - 10 | It crashes on the first and second track. I believe this is because I have switched the kernel size to 5, 5.
Test 5 - Model made by using data from the first track and the second track | Loss - 0.117 | Epochs - 10 | Works perfectly on the first track. It crashes on the second one.
Test 6 - Model made by using data from the first track and the second track | Loss - 0.123 | Epochs - 15 | Works perfectly on the first track. It crashes on the second one at the middle of the track, on a tight rurn.
Test 7 - Model made by using data from the first track and the second track, with less pixels cropped from the top of the img | Loss - 0.199 | Epochs - 20 | It doesn't work on either track.
Test 8 - Model made by using data from the first track and the second track, with a smaller lateral offset for the images. | Loss - 0.105 | Epochs - 5 | Works perfectly on the first track. It crashes on the second one.
Test 9 - Model made by traing the 8th test 5 epochs more | Loss - 0.106 | Epochs - 5 | Works perfectly on the first track. It crashes on the second one.