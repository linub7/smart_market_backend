const messageTag = document.getElementById('message');

window.addEventListener('DOMContentLoaded', async () => {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => {
      return searchParams.get(prop);
    },
  });
  const { id, token } = params;

  const response = await fetch(`/api/v1/auth/verify-email`, {
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

  const {
    data: { message },
  } = await response.json();
  messageTag.innerText = message;
});
