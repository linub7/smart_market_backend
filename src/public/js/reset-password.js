const form = document.getElementById('form');
const messageTag = document.getElementById('message');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');
const notification = document.getElementById('notification');
const submitBtn = document.getElementById('submit');

const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/;

form.style.display = 'none';
let token;
let id;

window.addEventListener('DOMContentLoaded', async () => {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => {
      return searchParams.get(prop);
    },
  });
  // const { id, token } = params;
  token = params.token;
  id = params.id;

  const response = await fetch(`/api/v1/auth/verify-password-reset-token`, {
    method: 'POST',
    body: JSON.stringify({ id, token }),
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  if (!response.ok) {
    const { message } = await response.json();
    messageTag.innerText = message;
    messageTag.classList.add('error');
    return;
  }

  messageTag.style.display = 'none';
  form.style.display = 'block';
});

const displayNotification = (msg, type) => {
  notification.style.display = 'block';
  notification.innerText = msg;
  notification.classList.add(type);
};

const handleSubmit = async (e) => {
  e.preventDefault();

  // validate
  if (!password?.value.trim() || password?.value?.length < 8)
    return displayNotification(
      'Password is required and have to be at least 8 characters!',
      'error'
    );

  if (!passwordRegex.test(password.value))
    return displayNotification(
      'Invalid password, use alpha and numeric and special characters.',
      'error'
    );

  if (password?.value?.trim() !== confirmPassword?.value?.trim())
    return displayNotification('Passwords mismatch', 'error');

  // submit
  submitBtn.disabled = true;
  submitBtn.innerText = 'Please wait...';

  const response = await fetch(`/api/v1/auth//reset-password`, {
    method: 'POST',
    body: JSON.stringify({ id, token, password: password.value }),
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  submitBtn.disabled = false;
  submitBtn.innerText = 'Update Password';

  if (!response.ok) {
    const { message } = await response.json();
    return displayNotification(message, 'error');
  }

  messageTag.style.display = 'block';
  messageTag.innerText = 'Your Password updated successfully';
  form.style.display = 'none';
};

form.addEventListener('submit', handleSubmit);
