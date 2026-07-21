constructor() {
    console.log("ANTES");

    this.creditsService = new CreditsService();

    console.log("DEPOIS CREDITS");

    this.gameRepository = new GameRepository();

    console.log("DEPOIS GAME");

    this.railwayClient = new RailwayClient();

    console.log("FIM");
}
