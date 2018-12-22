import logging
import boto3
import json
import os
from botocore.vendored import requests

# Initialize logger and set log level
logger = logging.getLogger()
logger.setLevel(logging.INFO)

session = boto3.Session(
    region_name="us-west-2"
)
sns_client = session.client('sns')
sqs_client = boto3.client('sqs')
sqs = boto3.resource('sqs')
queue_url = 'https://sqs.us-west-2.amazonaws.com/457946912569/social_likes'

queue = sqs.Queue(queue_url)

def lambda_handler(event, context):

    # TODO implement

    a=json.loads(event['Records'][0]['body'])
    b=a['data']
    logger.info(a)
    u_id = a['resp']['id']
    # u_id = a['resp']['authResponse']['userID']
    logger.info(u_id)
    logger.info(b)
    texta=' '
    for messages in b:
        if 'name' in messages.keys():
            logger.info('in loop ')
            logger.info(messages)
            texta=texta + ' . \n\n\n'+messages['name']


    #Sending notification about new post to SNS
    temp = {}
    texta=texta.lower().replace(':d',' ').replace(':o', ' ').replace(':p', ' ').replace('xd',' ').replace('\\', ' ').replace('/',' ').replace('<3', ' ').replace(':(', ' ').replace(':)',' ').replace(':\'',' ').replace('(', ' ').replace(')',' ' ).replace('ud83d','').replace('ude02','')

    texta = "Hi there! Hope you are having a good day. Here are the pages which you have liked \n\n\n"+texta

    temp['msg']=texta
    temp['u_id']=u_id
    client = boto3.client('sns')
    client.publish(
        TopicArn = 'arn:aws:sns:us-west-2:457946912569:likes',
        Message = json.dumps(temp)
    )

    return
   
