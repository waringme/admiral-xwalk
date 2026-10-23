const API_PATH = '/weather';
const LOCAL_EDGE_FUNCTION_ORIGIN = 'http://127.0.0.1:7676';
const DEFAULT_HEADING = 'Current local weather';

function getWeatherApiUrl() {
  const { hostname } = window.location;
  const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1';
  return isLocalDev ? `${LOCAL_EDGE_FUNCTION_ORIGIN}${API_PATH}` : API_PATH;
}

async function fetchWeather() {
  const response = await fetch(getWeatherApiUrl(), {
    cache: 'no-store',
    headers: { Accept: 'text/plain' },
  });

  if (!response.ok) {
    throw new Error(`Weather service returned HTTP ${response.status}`);
  }

  const weather = (await response.text()).trim();
  if (!weather) {
    throw new Error('Weather service returned an empty response');
  }

  return weather;
}

function renderMessage(element, message, state) {
  element.textContent = message;
  element.className = `weather-result weather-result-${state}`;
}

export default async function decorate(block) {
  const headingText = block.children[0]?.firstElementChild?.textContent.trim();
  const heading = document.createElement('h2');
  heading.className = 'weather-heading';
  heading.dataset.aueProp = 'heading';
  heading.dataset.aueLabel = 'Heading';
  heading.dataset.aueType = 'text';
  heading.textContent = headingText || DEFAULT_HEADING;

  const result = document.createElement('p');
  result.className = 'weather-result weather-result-loading';
  result.setAttribute('role', 'status');
  result.setAttribute('aria-live', 'polite');
  result.textContent = 'Loading current weather…';
  block.replaceChildren(heading, result);

  try {
    renderMessage(result, await fetchWeather(), 'success');
  } catch (error) {
    const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const message = isLocalDev
      ? 'Weather is unavailable. Start the local Edge Function server and try again.'
      : 'Weather is currently unavailable. Please try again later.';
    renderMessage(result, message, 'error');
  }
}
