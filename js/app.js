var author_id_global;
var author_name_global;
var author_image_url_global;
var paragraph_number = 1;

async function initFirebase() {
    var firebaseConfig = {
        apiKey: "AIzaSyDZyOqJh06FJbNyq8UrYTeeJTN-wauhnk8",
        authDomain: "walkwithgod-73ee8.firebaseapp.com",
        databaseURL: "https://walkwithgod-73ee8.firebaseio.com",
        projectId: "walkwithgod-73ee8",
        storageBucket: "walkwithgod-73ee8.appspot.com",
        messagingSenderId: "21802022919",
        appId: "1:21802022919:web:13b38ff7329ab81e8092a2",
        measurementId: "G-YQTM458L30"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
}

async function signInFirebase() {
    var email = document.getElementById('inputEmail').value;
    var password = document.getElementById('inputPassword').value;
    try {
        var result = await firebase.auth().signInWithEmailAndPassword(email, password);
        author_id_global = result.user.uid;
        await fetchUserProfile();
        alert("Hi " + author_name_global + ", start writing the article.");
    } catch (error) {
        alert(error.message);
    }
}

async function fetchUserProfile() {
    try {
        var doc = await firebase.firestore().collection("users").doc(author_id_global).get()
        author_name_global = doc.get("name");
        author_image_url_global = doc.get("image_url")
    } catch (error) {
        alert(error.message);
    }
}

async function submitArticle() {
    if (!author_id_global) {
        alert(" Please sign in.");
        return;
    }
    var title = document.getElementById('inputTitle').value;
    var description = document.getElementById('inputDescription').value;
    var image_url = document.getElementById('inputImageUrl').value;
    var content = [];
    for (var i = 1; i <= paragraph_number; i++) {
        var doc = document.getElementById('inputParagraph' + i).value.trim();
        if (doc !== "")
            content.push({ body: doc });
    }
    var data = {
        title: title,
        description: description,
        author_uid: author_id_global,
        content: content,
        created_date: firebase.firestore.Timestamp.now(),
        verified: false
    };
    if (author_name_global)
        data.author_name = author_name_global;
    if (author_image_url_global)
        data.icon = author_image_url_global;
    if (image_url.trim() !== "") {
        data.image_url = image_url;
    }
    console.log(data);
    try {
        var docRef = await firebase.firestore().collection("articles").add(data)
        alert("Document Saved!");
        console.log("Document written with ID: ", docRef.id);
    } catch (error) {
        if (error.code === "permission-denied") {
            alert(error.message + " Please sign in first.");
        } else {
            alert(error.message);
        }
    }
}

function validateArticle() {
    window.addEventListener('load', function () {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                } else {
                    submitArticle();
                    event.preventDefault();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
}

function addParagraph() {
    paragraph_number++;
    var ul = document.getElementById("listParagraph");
    var li = document.createElement("li");
    var textarea = document.createElement("textarea");
    textarea.setAttribute("class", "form-control paragraph");
    textarea.setAttribute("rows", "3");
    textarea.setAttribute("id", "inputParagraph" + paragraph_number);
    textarea.setAttribute("placeholder", "Paragraph " + paragraph_number + " (Optional)");
    li.appendChild(textarea);
    li.setAttribute("id", "element" + paragraph_number); // 
    ul.appendChild(li);
}

function removeParagraph() {
    if (paragraph_number <= 1) return;
    paragraph_number--;
    var ul = document.getElementById('listParagraph');
    ul.removeChild(ul.lastElementChild);
}