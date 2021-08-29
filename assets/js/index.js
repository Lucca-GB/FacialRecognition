const cam = document.getElementById('cam')

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