const request = require('request-promise-native');
const { JSDOM } = require('jsdom');

const SF_URL = 'https://www.metoffice.gov.uk/public/weather/marine/shipping-forecast#all';

const parseForecast = dt => {
  const forecast_type = dt.innerHTML;
  const forecast_value = dt.nextElementSibling.innerHTML;

  return { forecast_type, forecast_value };
};

const parseGaleWarning = gw => {
  if (!gw) return null;

  const warning = gw.querySelector('p').innerHTML;

  const issueTimeText = gw
    .querySelector('.issueTime')
    .innerHTML
    .replace('Gale warning - issued: ', '');

  const [ time, date ] = issueTimeText.split(/\son\s/);
  const [ hours, minutes ] = time.split(':').map(n => ~~n);

  const dateObj = new Date(date);
  dateObj.setUTCMinutes(minutes);
  dateObj.setUTCHours(hours);

  const issue_time = dateObj.getTime();

  return {
    warning,
    issue_time
  };
};

const parseCard = card => {
  const area = card.querySelector('.cardHeader').innerHTML;
  const forecasts = Array
    .from(card.getElementsByTagName('dt'))
    .map(parseForecast);

  const galeWarning = parseGaleWarning(card.querySelector('.warningInfo'));

  return { area, forecasts, galeWarning };
};

async function getSFData() {
  try {
    const html = await request(SF_URL);
    const { window } = new JSDOM(html);

    const cards = window.document.querySelectorAll('.marineCard[data-value]')

    const areas = Array
      .from(cards)
      .map(parseCard);

    return areas;
  } catch(e) {
    throw new Error(e);
  }
}

module.exports = { getSFData };
