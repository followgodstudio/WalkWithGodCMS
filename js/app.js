var author_id_global;
var author_name_global;
var author_icon_global;
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
        author_icon_global = doc.get("image_url")
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
    var author_name = document.getElementById('inputAuthorName').value;
    var author_icon = document.getElementById('inputAuthorIcon').value;
    var content = [];
    for (var i = 1; i <= paragraph_number; i++) {
        var subtitle = document.getElementById('inputSubtitle' + i).value.trim();
        var body = document.getElementById('inputParagraph' + i).value.trim();
        if (body !== "")
            content.push({ index: i - 1, subtitle: subtitle, body: body});

    }
    var data = {
        title: title,
        description: description,
        author_uid: author_id_global,
        created_date: firebase.firestore.Timestamp.now(),
        verified: false
    };
    if (author_name.trim() !== "") {
        data.author_name = author_name;
    } else {
        if (author_name_global)
            data.author_name = author_name_global;
    }
    if (author_icon.trim() !== "") {
        data.icon = author_icon;
    } else {
        if (author_icon_global)
            data.icon = author_icon_global;
    }
    if (image_url.trim() !== "") {
        data.image_url = image_url;
    }
    console.log(data);
    console.log(content);
    await addArticleInFirebase(data, content);
}

async function addArticleInFirebase(data, content) {
    try {
        var db = firebase.firestore();
        var docRef = await db.collection("articles").add(data);
        var batch = db.batch();
        content.forEach((doc) => {
            batch.set(db.collection("articles").doc(docRef.id).collection('content').doc(), doc);
        });
        await batch.commit();
        alert("Article Saved!");
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

    var input = document.createElement("input");
    input.setAttribute("class", "form-control subtitle");
    input.setAttribute("id", "inputSubtitle" + paragraph_number);
    input.setAttribute("placeholder", "Subtitle " + paragraph_number + " (Optional)");
    li.appendChild(input);

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