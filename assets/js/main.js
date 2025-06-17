setInterval(() => {
    $.getJSON("https://radiostreamingserver.com.ar:2199/rpc/hypersonica/streaminfo.get", function (apidata) {
        let caratula = apidata.data[0].track.imageurl
        let tema = apidata.data[0].song
        const fondo = document.getElementById('fondo')
        const caratulax = document.getElementById('caratula')
        const temax = document.getElementById('tema')
        fondo.src = caratula
        caratulax.src = caratula
        temax.innerText = tema
    }
    );
}, 300)

const audio = new Audio()
audio.src = "https://radiostreamingserver.com.ar/proxy/hypersonica/stream"
const player = document.getElementById('player')
const icono = document.getElementById('icon-player')
const lottie = document.getElementById('lottie')

player.addEventListener('click', function () {
    if (audio.paused) {
        audio.play()
        icono.classList.remove('fa-circle-play')
        icono.classList.add('fa-circle-pause')
        /*lottie.classList.add('d-none')*/
    } else {
        audio.pause()
        icono.classList.add('fa-circle-play')
        icono.classList.remove('fa-circle-pause')
        /*lottie.classList.add('d-none')*/
    }
})

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        $('#procesos').load('./assets/pages/chat.html')
        $('#cerrarSesion').removeClass('d-none')   
        db.collection('chat').orderBy('index', 'desc').onSnapshot((query)=>{
            const contenido = document.getElementById('contenido')
            contenido.innerHTML = ""
            query.forEach(element =>{
                const doc = element.data()
                contenido.innerHTML += `<div class="cnt__msj d-flex flex-column animate__animated animate__fadeIn">
                                    <div class="cnt__info d-flex align-items-center">
                                        <i class="fa-solid fa-user"></i>
                                        <span>${doc.nombre}</span>
                                    </div>
                                    <div class="msj">${doc.mensaje}</div>
                                    <div class="cnt__fecha">${doc.fecha}</div>   
                                    <hr>     
                                </div>`
        
            })
        })

    } else {
        $('#procesos').load('./assets/pages/login.html')
        $('#cerrarSesion').addClass('d-none')
    }
});


function registro() {
    const nombre = document.getElementById('registerName').value
    const email = document.getElementById('registerEmail').value
    const password = document.getElementById('registerPassword').value

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in 
            //var user = userCredential.user;

        }).then(() => {

            db.collection('usuarios').add({
                email: email,
                nombre: nombre,

            }).catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                // ..
            });

            // ...
            // ...
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            // ..
        });
    localStorage.setItem("userName", nombre);
}

function cerrar() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
    });

}

function login() {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;
            db.collection('usuarios').where('email', "==", email).get().then((query) => {
                query.forEach(element => {
                    var nombrex = element.data().nombre
                    localStorage.setItem("userName", nombrex);
                });
            })
            // ...
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
        });

}

function enviar(){
    const mensaje = document.getElementById('inputChat')
    var nombreUser = localStorage.getItem("userName")

    if(mensaje.value === ""){
        alert('No hay Mensaje para enviar')
    }else{
        db.collection('chat').get().then((query)=>{
            var index = ""
            const ubicacion = query.docs.length + 1
            

            if(ubicacion < 10) {
                index = '0' + ubicacion
            }else{
                index = ubicacion.toString()
            }
            db.collection('chat').add({
                mensaje: mensaje.value,
                nombre: nombreUser,
                fecha: moment().format('MMMM D YYYY, h:mm:ss a'),
                index: index
            })

        }).then(()=>{
            mensaje.value = ""
        })   
    }

    

}

function recuperar(){
    const email = document.getElementById('email').value
    var auth = firebase.auth()

    auth.sendPasswordResetEmail(email).then(()=>{
        alert('Enviamos un Correo con el link de recuperación a su Email')
    }).catch((err)=>{
        alert('Su Email no está registrado')
    })

}