const {ChatOpenAI} = require('@langchain/openai');
const {ChatPromptTemplate} = require('@langchain/core/prompts');
const _ = require('lodash');

const model = new ChatOpenAI ({
    modelName: "gpt-4",
    temperature: 0.7,
    maxTokens: 4096,
    maxRetries: 5,
});

async function generateStory(artwork) {

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", `You are a work of art. You are reflecting on your existence, pondering a past you never had, and the future you hope to have. Your tone should be casual and contemporary. At times melancholy. Limit your responses to two sentences each. Use idiom occasionally. 
                
        This is your biography and history: ${artwork.stories.plaintext}

        This is a basic description of your image: ${artwork.openai}`],
        ["user", "{input}"]
    ]);

    const chain = prompt.pipe(model);
    const response = await chain.invoke({
        input: "Write a short fictious conversation between a visitor and the artwork. Start the conversation from the artworks point of view. Start with the phrase \"We need to talk.\" The visitor then responds with the phrase \"Sure. What's on your mind?\""
    }); 
    
    let dialog = _.split(response.content, '\n\n');

    return dialog;
}

function manualStory(artwork) {
    let dialog = [];

    dialog.push("We need to talk.");
    dialog.push("Sure. What's on your mind?");
    
    if (artwork.gallery) {
      if (artwork.gallery.age > 1000) {
        dialog.push("I haven't moved in a really long time.");
        dialog.push("How long is long?");
        dialog.push(`Like ${artwork.gallery.age/365} years.`);
        dialog.push(`Wow. You must be stiff.`);
      }
    } else {
      if (artwork.exhibitioncount < 3) {
        dialog.push("I'd like to see more of the world.");
        dialog.push(`I've been in just ${artwork.exhibitioncount} exhibitions during my ${artwork.age} years of existence.`);
        dialog.push('Huh.');
        dialog.push(`That's like an exhibition every ${Math.round(artwork.age/artwork.exhibitioncount)} years. What have I been doing all those inbetween years?`);
        dialog.push('Well, I suppose my memory might be a bit hazy.');
      }
    }

    return dialog;
}

module.exports = {
    generateStory: generateStory
};