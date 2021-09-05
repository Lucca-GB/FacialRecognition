const cam = document.getElementById('cam')

const startVideo = () => {
    navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        if(Array.isArray(devices)){
            //tem dispositivos(nao necessariamente camera)
            devices.forEach(device => {
                if(device.kind === 'videoinput'){
                    //é uma camera
                    if(device.label.includes('')){
                        //dentro do '', colocar o modelo da camera
                        navigator.getUserMedia(
                            { video: {
                                deviceId: device.deviceId
                            }},
                            stream => cam.srcObject = stream,
                            error => console.error(error)
                        )
                    }
                }
            })
        }
    })
}
//nets da acesso a todas as redes e modelos do projeto
Promise.all([
    //detecta rostos presentes no video/imagem/camera e vai marcar com um quadrado emv volta
    faceapi.nets.tinyFaceDetector.loadFromUri('/assets/lib/face-api/models'),
    //vai desenhar os tracos do meu rosto, como olhos, boca...
    faceapi.nets.faceLandmark68Net.loadFromUri('/assets/lib/face-api/models'),
    //vai fazer o reconhecimento individual, quem sou eu...
    faceapi.nets.faceRecognitionNet.loadFromUri('/assets/lib/face-api/models'),
    //detecta minha expressao facial, se eu estou feliz, triste, raiva...
    faceapi.nets.faceExpressionNet.loadFromUri('/assets/lib/face-api/models'),
    //vai detectar a minha idade e o meu genero
    faceapi.nets.ageGenderNet.loadFromUri('/assets/lib/face-api/models'),
    //vai ser usar internamente para detecar o meu rosto
    faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/lib/face-api/models')
//objetos do faceapi carregados
//com isso, temos acesso aos objetos disponiveis do face-api, basta utiliza-los
]).then(startVideo)

cam.addEventListener('play', async () => {
    const canvas = faceapi.createCanvasFromMedia(cam)
    const canvasSize = {
        width: cam.width,
        height: cam.height
    }
    faceapi.matchDimensions(canvas, canvasSize)
    document.body.appendChild(canvas)
    //aqui usamos nosso primeiro objeto para detectar o rosto da pessoa
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
            cam,
            new faceapi.TinyFaceDetectorOptions()
            )
            //le os traços do meu rosto
            .withFaceLandmarks()
            //le a minha expressao facial
            .withFaceExpressions()
            //le minha idade e genero
            .withAgeAndGender()
        const resizedDetections = faceapi.resizeResults(detections, canvasSize)
        //limpa cada frame detectado, deixando so o atual
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        //desenha a deteccao do rosto
        faceapi.draw.drawDetections(canvas, resizedDetections)
        //desenha as land marks
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        //indica minha possivel expressão facial
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        //instanciamos para detectar minha idade e genero
        resizedDetections.forEach(detection => {
            //passamos o parametro que queremos detectar
            const { age, gender, genderProbability} = detection
            //função para apontar os valores de idade e genero que serão detectados
            new faceapi.draw.DrawTextField([
                `${parseInt(age, 10)} years`,
                `${gender} (${parseInt(genderProbability * 100, 10)})`
            //pedimos para desenhar e onde desenhar os valores detectados
            ], detection.detection.box.topRight).draw(canvas)
        })
    }, 100)
})