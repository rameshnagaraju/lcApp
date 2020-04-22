"use strict";

const AWS = require("aws-sdk");

const TRAININGS_TABLE = process.env.DYNAMODB_TABLE;
const AWS_DEPLOY_REGION = process.env.AWS_DEPLOY_REGION;
const dynamoDb = new AWS.DynamoDB.DocumentClient({
  api_version: "2012-08-10",
  region: AWS_DEPLOY_REGION,
});

module.exports.createTraining = async (event) => {
  let parsedJsonobj;
  try {
    parsedJsonobj = JSON.parse(event.body);
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
  } = parsedJsonobj;

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
    return { statusCode: 200, body: JSON.stringify(params.Item.trainingId) };
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
  // Validate If the path has training Id
  if (!event.pathParameters.trainingId) {
    return {
      statusCode: 404,
      error: `No trainingId in path parameter: ${JSON.stringify(
        event.pathParameters
      )}`,
    };
  }

  // Validate that the body has parameters to update
  let parsedJsonobj;
  try {
    parsedJsonobj = JSON.parse(event.body);
  } catch (err) {
    console.error(`Could not parse requested JSON ${event.body}: ${err.stack}`);
    return {
      statusCode: 400,
      error: `Could not find parameters to update : ${err.stack}`,
    };
  }

  //  Get the parameter name and parameter value to be updated

  const paramsName = parsedJsonobj.paramName;
  const paramsValue = parsedJsonobj.paramValue;
  const trainingId = event.pathParameters.trainingId;

  const params = {
    TableName: TRAININGS_TABLE,
    Key: { trainingId },
    ConditionExpression: "attribute_exists(trainingId)",
    UpdateExpression: "set " + paramsName + " = :v",
    ExpressionAttributeValues: {
      ":v": paramsValue,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const data = await dynamoDb.update(params).promise();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    console.log(`update Training ERROR=${error.stack}`);
    return {
      statusCode: 400,
      error: `Could not update Training: ${error.stack}`,
    };
  }
};

module.exports.deleteTraining = async (event) => {
  // Validate Inputs
  if (!event.pathParameters.trainingId) {
    return {
      statusCode: 404,
      error: `No trainingId in path parameter: ${JSON.stringify(
        event.pathParameters
      )}`,
    };
  }

  // We have valid input, Now prepare the params for Database delete operation
  const params = {
    TableName: TRAININGS_TABLE,
    Key: { trainingId: event.pathParameters.trainingId },
  };

  // Delete from DB
  try {
    const data = await dynamoDb.delete(params).promise();
    return { statusCode: 200, body: JSON.stringify("Training  Deleted") };
  } catch (error) {
    console.log(`delete Training ERROR=${error.stack}`);
    return {
      statusCode: 400,
      error: `Could not delete Training: ${error.stack}`,
    };
  }
};
