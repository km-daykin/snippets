exports.handler = async function (context, event, callback) {

    const twilioClient = context.getTwilioClient();

    const response = new Twilio.Response();
    const responseBody = {
        success: false,
        payload: {
            errors: []
        }
    };

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    };

    response.setHeaders(corsHeaders);

    try {

        const conversation = await twilioClient.conversations
            .conversations(event.conversationSid)
            .fetch();

        const {flexInteractionSid, flexInteractionChannelSid} = JSON.parse(conversation.attributes);

        // close the interaction (https://www.twilio.com/docs/flex/developer/conversations/interactions-api/channels-subresource#close-an-interaction-channel)
        const closedInteraction = await twilioClient.flexApi.v1
            .interaction(flexInteractionSid)
            .channels(flexInteractionChannelSid)
            .update({status: 'closed', routing: 'closed'});

        responseBody.success = true;
        responseBody.payload.message = "Chat ended.";

    } catch (e) {

        // We've caught an error! Handle the HTTP error response
        console.error(e.message || e);

        response.setStatusCode(e.status || 500);
        responseBody.success = false;
        responseBody.payload.errors = responseBody.payload.errors || [];
        responseBody.payload.errors.push({code: e.code || 500, message: e.message});
    }

    response.setBody(responseBody);
    callback(null, response);
}
