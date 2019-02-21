const { VirtualAlexa } = require("virtual-alexa");

describe("test skill", () => {
    let alexa;
    beforeEach(() => {
		alexa = new VirtualAlexa.Builder()
			.handler("index.js")
			.interactionModelFile("../../models/en-US.json")
			.create();
    });

    test.only("Basic dialog", async (done) => {
        let response = await alexa.launch();
        expect(response.prompt()).toContain("Welcome to pet match");
        response = await alexa.request().intent("PetMatchIntent").slot("size", "small").send();
        
        let request = await alexa.request()
            .intent("PetMatchIntent")
            .slot("temperament", "guard");
        
        response = await request.send();
        expect(request.json().request.dialogState).toBe("IN_PROGRESS");
        
        response = await alexa.request().intent("PetMatchIntent")
            .slot("energy", "low")
            .dialogState("COMPLETED")
            .send();
        expect(response.prompt()).toContain("So a small guard low energy dog sounds good");
        
        response = await alexa.intend("AMAZON.StopIntent");
        expect(response.prompt()).toContain("Bye");
        expect(response.attr("key")).toEqual("value");
        
        done();
    });

    test("Launch and end", async (done) => {
        let response = await alexa.launch();
        response = await alexa.endSession();
        expect(response).toBeUndefined();
        done();
    });

    test("Disambiguation of slot value (multiple entities resolved)", async (done) => {
        let response = await alexa.launch();
        expect(response.prompt()).toContain("Welcome to pet match");
        response = await alexa.call(alexa.request().intent("PetMatchIntent").slot("size", "mini"));
        expect(response.prompt()).toContain("Which would you like   small  or tiny?");
        done();
    });

    test("Invalid slot value (entity cannot be resolved)", async (done) => {
        let response = await alexa.launch();
        expect(response.prompt()).toContain("Welcome to pet match");
        response = await alexa.call(alexa.request().intent("PetMatchIntent").slot("size", "grandiose"));
        expect(response.prompt()).toContain("What size are you looking for");
        done();
    });

});

process.on("unhandledRejection", (e) => {
    console.log("ERRROR"  + e);
})