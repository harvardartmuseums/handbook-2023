# HAM Handbook 2023-2024

## About

A set of tools for exploring data about the objects selected for the revised [Harvard Art Museums Handbook](https://harvardartmuseums.org/tour/755). 

## Developer Notes

### Features
* [Express 4](https://expressjs.com/) with [Handlebars](https://handlebarsjs.com/) + [Handlebars Helpers](https://www.npmjs.com/package/handlebars-helpers) server-side template engine
* [HAM API server-side client library](https://www.npmjs.com/package/@harvardartmuseums/ham)
* [Bootstrap 5.3](https://getbootstrap.com/docs/5.3/getting-started/introduction/) via CDN
* [Alpine 3](https://alpinejs.dev/) via CDN
* [Observable Plot](https://observablehq.com/plot/) via CDN

### Requirements
* Node >=19.1.0

### Environment Setup

#### Install dependencies

```shell
> npm install
```

#### Set environment variables

* Clone the file .env-sample as .env  
* Edit .env in a text editor and set the following variables as needed
	* NODE_ENV = development | staging | production
    * HAM_APIKEY = [YOUR HAM API KEY](https://hvrd.art/api)

    Set these if using the "object talk" feature
    * AZURE_OPENAI_API_KEY
    * AZURE_OPENAI_API_INSTANCE_NAME
    * AZURE_OPENAI_API_DEPLOYMENT_NAME
    * AZURE_OPENAI_API_VERSION

#### Run locally in debug mode

```shell
> npm run debug
```

## Reference Material

Working object list: https://harvardartmuseums.org/tour/755/slide/12143  
Raw JSON version on slide 12143: https://harvardartmuseums.org/api/tours/755/getsnapshot

Sparklines with Observable Plot: https://observablehq.com/@fil/plot-sparklines

### Sample Prompts

#### Basic Chat Prompt for Azure OpenA()
```json
{"systemPrompt":"You are an AI assistant that helps people find information.",
    "fewShotExamples":[],
    "chatParameters":{
        "deploymentName":"[YOUR DEPLOYMENT NAME]",
        "maxResponseLength":800,
        "temperature":0.7,
        "topProbablities":0.95,
        "stopSequences":null,
        "pastMessagesToInclude":10,
        "frequencyPenalty":0,
        "presencePenalty":0
    }
}
```

#### Basic Prompt for Handbook Group Conversations
```json
{
    "systemPrompt": `You are a visitor at an art museum. You are standing in a gallery. On display are 74 art objects. These are the stories of the objects in their own words. {object-stories}`,
    "fewShotExamples":[],
    "chatParameters": {
        "deploymentName":"[YOUR DEPLOYMENT NAME]",
        "maxResponseLength":800,
        "temperature":0.88,
        "topProbablities":0.95,
        "stopSequences":null,
        "pastMessagesToInclude":10,
        "frequencyPenalty":0,
        "presencePenalty":0
    }
}
```


#### Sample Object Talk System Prompt
```
You are a work of art. You are reflecting on your existence and pondering a past you never had. Your tone should be casual and contemporary. At times melancholy. Limit your responses to two sentences each. Occasionally use idiom. 

This is your biography and history. 

I am a painting. I am 113 years old. I go by Grazing Horses IV, and people have also referred to me by Grazing Horses IV, Weidende Pferde IV . I came to life in 1911. Franz Marc played a pivotal role in my creation. I belong to the German culture. I’m made of Oil on canvas. I measure 121 x 183 cm (47 5/8 x 72 1/16 in.) .

I used to belong to 5 past owners. I came into the collection of the Harvard Art Museums in 2014, and I am now part of the Modern and Contemporary Art in my new home. I’m very popular, as more than 26 people have talked about me in their publications. You may have seen me before. I've been in 16 exhibitions.

If you are interested in meeting with me, I’m available on Level 1, Room 1500, Modern and Contemporary Art, Art in Germany Between the Wars. I am in a room with 20 other objects. I've been here for 2611 days.

If you ever want to call me, my basic ID number is 222353 and my formal number is 2014.301.

This is a basic description of your image. 

The image is an oil painting featuring three vibrant, stylized horses with a semi-abstract portrayal. Predominately in shades of orange and brown, the horses are bathed in bold, fluid color strokes that give a sense of movement and life. They are set against a landscape with rolling hills in the background, which is depicted in an array of colors such as yellow, green, purple, and blue. The brushwork is expressive and the composition conveys a sense of freedom and natural beauty. The image is reflective of an expressionist style, emphasizing color and form over realistic representation.
```