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
# sqs_client = boto3.client('sqs')
# sqs = boto3.resource('sqs')
# queue_url = 'https://sqs.us-west-2.amazonaws.com/457946912569/fb_app'

# queue = sqs.Queue(queue_url)

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
    i=0
    for messages in b:

        if 'message' in messages.keys():
            i+=1
            logger.info('in loop ')
            logger.info(messages)
            # if (i%10)==1:
            #     texta='\n\n The '+str(i)+'st post is '+messages['message']
            # elif (i%10)==2:
            #     texta=texta+ '\n\n The '+str(i)+'nd post is '+messages['message']
            # elif (i%10)==3:
            #     texta=texta+ '\n\n The '+str(i)+'rd post is '+messages['message']
            # else:
            #     texta=texta+ '\n\n The '+str(i)+'th post is '+messages['message']
            texta = texta +"\n\n\n\n"+messages['message']


    # for record in event['Records']:
    #     # print(record['body'])
    #     logger.info('fuck monish',record['data'])
    # for data in record['body']['data']:
    #     pass






    # response = sns_client.publish(
    # PhoneNumber='+19295309076',
    # MessageAttributes={
    #     'AWS.SNS.SMS.SenderID': {
    #         'DataType': 'String',
    #         'StringValue': 'SENDERID'
    #     },
    #     'AWS.SNS.SMS.SMSType': {
    #         'DataType': 'String',
    #         'StringValue': 'Promotional'
    #     }
    # }
    # )
    texta=texta.lower().replace(':d',' ').replace(':o', ' ').replace(':p', ' ').replace('xd',' ').replace('\\', ' ').replace('/',' ').replace('<3', ' ').replace(':(', ' ').replace(':)',' ').replace(':\'',' ').replace('(', ' ').replace(')',' ' ).replace('ud83d','').replace('ude02','')
    #Sending notification about new post to SNS
    temp = {}
    texta = "Hi there! Hope you are having a good day. Here is your timeline \n\n\n"+texta
    temp['msg']=texta
    temp['u_id']=u_id
    client = boto3.client('sns')
    client.publish(
        TopicArn = 'arn:aws:sns:us-west-2:457946912569:SNS_TOPIC',
        Message = json.dumps(temp)
    )

    return
    # entries = [{'Id': msg['MessageId'], 'ReceiptHandle': msg['ReceiptHandle']} for msg in resp['Messages']]
    # resp_del = sqs_client.delete_message_batch(QueueUrl=queue_url, Entries=entries)
    # print ((resp['Messages']))
    # logger.info ((resp['Messages']))
    # return (resp['Messages'])
