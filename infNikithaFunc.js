"use strict";

const AWS = require("aws-sdk");

const TRAININGS_TABLE = process.env.DYNAMODB_TABLE;
const AWS_DEPLOY_REGION = process.env.AWS_DEPLOY_REGION;
const dynamoDb = new AWS.DynamoDB.DocumentClient({
  api_version: "2012-08-10",
  region: AWS_DEPLOY_REGION,
});

/*
    Function to Add training
*/

module.exports.createTraining = async (event) => {
  let _parsedJsonobj;
  try {
    _parsedJsonobj = JSON.parse(event.body);
  } catch (err) {
    console.error(`Could not parse requested JSON ${event.body}: ${err.stack}`);
    return {
      statusCode: 500,
      error: `Could not parse requested JSON: ${err.stack}`,
    };
  }

  const {
    trainingId,
    trainingName,
    trainingDescription,
    resourceName,
  } = _parsedJsonobj;

  const params = {
    TableName: TRAININGS_TABLE,
    Item: {
      trainingId,
      trainingName,
      trainingDescription,
      resourceName,
    },
  };

  try {
    const data = await dynamoDb.put(params).promise();
    console.log(`createTraining data=${JSON.stringify(data)}`);
    return { statusCode: 200, body: JSON.stringify(params.Item) };
  } catch (error) {
    console.log(`createTraining ERROR=${error.stack}`);
    return {
      statusCode: 400,
      error: `Could not create message: ${error.stack}`,
    };
  }
};

/*
    Function to Read info on training
*/
module.exports.getTraining = async (event) => {
  if (!("queryStringParameters" in event) || !event.queryStringParameters) {
    return {
      statusCode: 404,
      error: `No Query String`,
    };
  }
  if (!event.queryStringParameters.trainingId) {
    return {
      statusCode: 404,
      error: `No trainingId in Query String: ${JSON.stringify(
        event.queryStringParameters
      )}`,
    };
  }
  // We have valid input, proceed now to query the database
  const params = {
    TableName: TRAININGS_TABLE,
    Key: { trainingId: event.queryStringParameters.trainingId },
  };

  try {
    const data = await dynamoDb.get(params).promise();
    if (!data || typeof data === "undefined" || !data.Item) {
      console.log(
        `getMessage did not find trainingId=${event.queryStringParameters.trainingId}`
      );
      return {
        statusCode: 404,
        error: `Could not find message for trainingId: ${event.queryStringParameters.trainingId}`,
      };
    } else {
      console.log(`getMessage data=${JSON.stringify(data.Item)}`);
      return { statusCode: 200, body: JSON.stringify(data.Item) };
    }
  } catch (error) {
    console.log(`getTraining ERROR=${error.stack}`);
    return {
      statusCode: 400,
      error: `Could not retrieve Training: ${error.stack}`,
    };
  }
};
/*
    Function to update info on training
*/

module.exports.updateTraining = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "updated Training",
      },
      null,
      2
    ),
  };
};

module.exports.deleteTraining = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Deleted Training",
      },
      null,
      2
    ),
  };
};
