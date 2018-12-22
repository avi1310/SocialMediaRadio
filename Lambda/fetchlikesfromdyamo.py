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
    logger.info(event)
    response = client.get_item(
    TableName='social',
    Key={
        'u_id' : { 'S' : 'likes_'+str(event) }
        }
        )

    logger.info(response)
    audio_link = response['Item']['url']['S']
    text = response['Item']['text']['S']
    return {'audio_link':audio_link,'text':text}
