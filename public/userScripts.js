

function submitForm() {
    const form = document.getElementById("myForm");
    const formData = new FormData(form);
    const jsonObject = {};
    formData.forEach((value, key) => {
    jsonObject[key] = value;
});
    
    fetch('user/create', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
},
    body: JSON.stringify(jsonObject),
})
    .then(response => response.json())
    .catch(error => {
    console.error('Error:', error);
});
}



async function createUser() {

    const userID = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/user/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: userID,
            name: name,
            password: password
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        await fetchAndDisplayUserInfo();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
}

// This function resets or initializes the demotable.
async function resetUserTable() {
    const response = await fetch("/user/reset", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "Usertable initiated successfully!";
        await fetchAndDisplayUserInfo();
    } else {
        alert("Error initiating user table!");
    }
}

// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    fetchAndDisplayUserInfo();
    document.getElementById("updateUserBtn").addEventListener("click", fetchAndDisplayUserInfo);
    document.getElementById("createUser").addEventListener("submit", createUser);
    document.getElementById("resetUserTable").addEventListener("click", resetUserTable);
};