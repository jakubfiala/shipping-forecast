const { S3 } = require('aws-sdk');
const { getSFData } = require('./get_data.js');

const S3_BUCKET = 'jakubfiala';
const S3_KEY = 'shipping-forecast.json';

const s3 = new S3();

const run = async () => {
  const sfData = await getSFData();

  const params = {
    Bucket: S3_BUCKET,
    Key: S3_KEY,
    Body: JSON.stringify(sfData),
    ACL: 'public-read',
    ContentType: 'application/json'
  };

  s3.putObject(params, (err, data) => {
    if (err) throw new Error(err);

    console.log(`Successfully updated the Shipping Forecast. ${Date.now()}`);
  });
};

run();
