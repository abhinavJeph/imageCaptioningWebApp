const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector("#browseBtn");
const translateBtn = document.querySelector('#translateBtn');
const reloadBtn = document.querySelector('#reloadBtn');

const bgProgress = document.querySelector(".bg-progress");
const progressPercent = document.querySelector("#progressPercent");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");
const status = document.querySelector(".status");

const resultContainer = document.querySelector(".result-container");
const audioURLBtn = document.querySelector("#audioURLBtn");
const imageText = document.querySelector("#imageText");

const toast = document.querySelector(".toast");

const uploadURL = 'https://imageurl.azurewebsites.net/api/HttpTrigger2';
const urlUploadURL = "https://image-captioning-web-app.onrender.com/hackathon/"
const getLatestItemURL = 'https://image-captioning-web-app.onrender.com/latest';

const imgContainer = document.querySelector(".image-container");
const imgVector = document.querySelector(".image-vector");

const maxAllowedSize = 100 * 1024 * 1024; //100mb
let speechSynthesis = window.speechSynthesis;

browseBtn.addEventListener("click", () => {
  fileInput.click();
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length === 1) {
    if (files[0].size < maxAllowedSize) {
      fileInput.files = files;
      uploadFile();
    } else {
      showToast("Max file size is 100MB");
    }
  } else if (files.length > 1) {
    showToast("You can't upload multiple files");
  }
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragged");
});

dropZone.addEventListener("dragleave", (e) => {
  dropZone.classList.remove("dragged");

  console.log("drag ended");
});

// file input change and uploader
fileInput.addEventListener("change", async (event) => {
  if (fileInput.files[0].size > maxAllowedSize) {
    showToast("Max file size is 100MB");
    fileInput.value = ""; // reset the input
    return;
  }
  await uploadFile();
  
  const image = new Image();
  image.classList.add('image-preview');

  // Read the selected file and set the image source
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    image.src = event.target.result;
  };
  reader.readAsDataURL(file);

  imgVector.style.display = 'none';
  dropZone.style.display = 'none';
  imgContainer.style.display = 'flex';
  imgContainer.appendChild(image);
});

// result container listenrs
audioURLBtn.addEventListener("click", () => {
  audioFunction();
});

imageText.addEventListener("click", () => {
  audioFunction();
});

const audioFunction = () => {
  const message = new SpeechSynthesisUtterance(); // create a new speech synthesis object
  message.text = imageText.innerText || "Hello, world!"; // set the text to be spoken
  speechSynthesis.speak(message);
};

const uploadFile = () => {
  files = fileInput.files;
  const formData = new FormData();
  formData.append("image", files[0]);

  //show the uploader
  progressContainer.style.display = "block";

  // upload file
  const xhr = new XMLHttpRequest();

  // listen for upload progress
  xhr.upload.onprogress = function (event) {
    // find the percentage of uploaded
    let percent = Math.round((100 * event.loaded) / event.total);
    progressPercent.innerText = percent;
    const scaleX = `scaleX(${percent / 100})`;
    bgProgress.style.transform = scaleX;
    progressBar.style.transform = scaleX;
  };

  // handle error
  xhr.upload.onerror = function () {
    showToast(`Error in upload: ${xhr.status}.`);
    fileInput.value = ""; // reset the input
  };

  // listen for response which will give the link
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      onFileUploadSuccess(xhr.responseText);
      console.log(xhr.responseText);
    }
  };

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

const onFileUploadSuccess = (res) => {
  fileInput.value = ""; // reset the input
  status.innerText = "Uploaded";
  // remove the disabled attribute from form btn & make text send
  progressContainer.style.display = "none"; // hide the box
  
  getTextFromImage(res);
};

const getTextFromImage = async (data) => {
  resultContainer.style.display = "block";
  data = JSON.parse(data);
  if (data.url) {
    var item = await uploadURLToDB(data.url);
    imageText.innerText = item ? item["text"] : data.url;
    translateBtn.style.display = 'inline-block';
  } else {
    const text = "The API did not provide a caption for the image.";
    showToast(text);
    console.error(text);
  }
}

async function uploadURLToDB(url) {
  try {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
  
    var raw = JSON.stringify({
      "url": url
    });
  
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
  
    var response = await fetch(urlUploadURL, requestOptions);
    response = response.json();
    console.log(response);
    return response;
  } catch (error) {
    showToast(error.message);
    console.log(error);
  }
}

let toastTimer;
// the toast function
const showToast = (msg) => {
  clearTimeout(toastTimer);
  toast.innerText = msg;
  toast.classList.add("show");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
};

window.addEventListener('beforeunload', function (event) {
  // stop the speech synthesis object
  speechSynthesis.cancel();
});

translateBtn.addEventListener('click', (event) => {
  event.preventDefault(); // prevent the button from submitting a form, if it's inside one

  fetch(getLatestItemURL)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {
      imageText.innerText = data.text;
      translateBtn.style.display = "none";
      reloadBtn.style.display = 'inline-block';
    })
    .catch(error => {
      console.error('There was a problem with the API request:', error);
    });
});

reloadBtn.addEventListener('click', (event) => {
  event.preventDefault();
  location.reload();
})
