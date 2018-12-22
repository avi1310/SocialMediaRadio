import boto3
import os
from contextlib import closing
from boto3.dynamodb.conditions import Key, Attr
import logging
import json

def lambda_handler(event, context):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    logger.info(event)
    print('event',event)
    postId=event["Records"][0]["Sns"]["MessageId"]
    logger.info(postId)
    q=event["Records"][0]["Sns"]["Message"]
    logger.info(type(q))
    logger.info('ioioiooioioioioioioioioooio')
    q1=json.loads(q)
    logger.info(q1)
    temp1 = q1["msg"]
    logger.info(temp1)
    postI = temp1
    u_id = q1['u_id']

    # print "Text to Speech function. Post ID in DynamoDB: " + postId

    #Retrieving information about the post from DynamoDB table
    # dynamodb = boto3.resource('dynamodb')
    # table = dynamodb.Table(os.environ['DB_TABLE_NAME'])
    # postItem = table.query(
    #     KeyConditionExpression=Key('id').eq(postId)
    # )


    # text = postItem["Items"][0]["text"]
    text = postI
    # voice = postItem["Items"][0]["voice"]
    voice = "Joanna"

    rest = text

    #Because single invocation of the polly synthesize_speech api can
    # transform text with about 1,500 characters, we are dividing the
    # post into blocks of approximately 1,000 characters.
    textBlocks = []
    # while (len(rest) > 1100):
    #     begin = 0
    #     end = rest.find(".", 1000)

    #     if (end == -1):
    #         end = rest.find(" ", 1000)

    #     textBlock = rest[begin:end]
    #     rest = rest[end:]
    #     textBlocks.append(textBlock)
    textBlocks.append(rest)

    #For each block, invoke Polly API, which will transform text into audio
    polly = boto3.client('polly')
    response = polly.synthesize_speech(
        OutputFormat='mp3',
        Text = text,
        VoiceId = voice
    )
    logger.info('i am here now yay')
    logger.info(response)
        #Save the audio stream returned by Amazon Polly on Lambda's temp
        # directory. If there are multiple text blocks, the audio stream
        # will be combined into a single file.
    if "AudioStream" in response:
        with closing(response["AudioStream"]) as stream:
            logger.info('in with')
            output = os.path.join("/tmp/", postId)

            with open(output, "ab") as file:
                file.write(stream.read())
    logger.info('bkl')

    s3 = boto3.client('s3')

    s3.upload_file('/tmp/' + postId,
      os.environ['BUCKET_NAME'],
      "likes"+postId + ".mp3")


    s3.put_object_acl(ACL='public-read',
      Bucket=os.environ['BUCKET_NAME'],
      Key= "likes"+postId + ".mp3")


    location = s3.get_bucket_location(Bucket=os.environ['BUCKET_NAME'])
    region = location['LocationConstraint']

    if region is None:
        url_begining = "https://s3.amazonaws.com/"
    else:
        url_begining = "https://s3-" + str(region) + ".amazonaws.com/"
    logger.info('yo mama is fo ')

    url = url_begining \
            + str(os.environ['BUCKET_NAME']) \
            + "/" \
            + "likes"\
            + str(postId) \
            + ".mp3"
    logger.info('after yo mama')
    logger.info(url)
    #Updating the item in DynamoDB
    dynamodb = boto3.resource('dynamodb')
    # table = dynamodb.Table(os.environ['DB_TABLE_NAME'])
    table = dynamodb.Table('social')

    table.put_item(
        Item={
            'u_id' : 'likes_'+u_id,
            'text' : text,
            'url' : url
        }
    )

    return
