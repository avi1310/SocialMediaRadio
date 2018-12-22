import json
import boto3
import time
import datetime
import logging
def lambda_handler(event, context):
    # TODO implement
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    client = boto3.client('dynamodb')

    time.sleep(4)

    response = client.get_item(
    TableName='social',
    Key={
        'u_id' : { 'S' : str(event) }
        }
        )
    logger.info(response)
    audio_link = response['Item']['url']['S']
    text = response['Item']['text']['S']
    # a={ "dialogAction": { "type":"Close", "fulfillmentState":'Fulfilled', "message":{ "contentType":"PlainText", "content":audio_link} } }
    return {'audio_link':audio_link,'text':text}
