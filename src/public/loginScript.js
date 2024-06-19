import UserList from "../model/user.model.js";

async function submitLoginForm(event) {
    event.preventDefault(); // Prevent the default form submission

    var form = document.getElementById('loginForm');
    var email = document.getElementById('email').value;
    // var password = form.querySelector('#password').value;
    role = UserList.findOne({email:email},'role');
    console.log(role);

    try {
        // Assume you have imported UserList correctly in your server-side code
        let response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
        let userData = await response.json();

        // Get the user role from the response
        let userRole = userData.role;
        console.log(userRole);

        switch (userRole) {
            case 'admin':
                form.action = '/adminLogin';
                break;
            case 'sub_admin':
                form.action = '/subAdminLogin';
                break;
            case 'owner':
                form.action = '/ownerLogin';
                break;
            case 'employee':
                form.action = '/employeeLogin';
                break;
            default:
                form.action = '/defaultActions';
        }

        form.submit(); // Submit the form with the dynamically set action
    } catch (error) {
        console.error('Error:', error);
        // Handle errors appropriately
    }
}
