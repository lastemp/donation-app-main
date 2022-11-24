// No imports needed: web3, anchor, pg and more are globally available

describe("Test donation-program", () => {
  const [campaignAccount, _] = web3.PublicKey
      .findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("campaign"),
          pg.wallet.publicKey.toBuffer()
        ],
        pg.program.programId
      );

  it('Should create campaign', async () => {
        await pg.program.methods
            .create('test campaign', 'test description', new anchor.BN(5 * anchor.web3.LAMPORTS_PER_SOL))
            .accounts({
                campaign: campaignAccount,
                user: pg.wallet.publicKey,
                systemProgram: web3.SystemProgram.programId,
            })
            .rpc();

        const campaignAcc = await pg.program.account.campaign.fetch(
            campaignAccount,
        );
        assert.equal(campaignAcc.name, 'test campaign');
        assert.equal(campaignAcc.description, 'test description');
        assert.ok(campaignAcc.targetAmount.eq(new anchor.BN(5 * anchor.web3.LAMPORTS_PER_SOL)));
        assert.ok(campaignAcc.owner.equals(pg.wallet.publicKey));
        assert.ok(campaignAcc.amountDonated.eq(new anchor.BN(0)));
    });

     it('Should donate to campaign', async () => {
        await pg.program.methods
            .donate(new anchor.BN(0.33 * anchor.web3.LAMPORTS_PER_SOL))
            .accounts({
                campaign: campaignAccount,
                user: pg.wallet.publicKey,
                systemProgram: web3.SystemProgram.programId,
            })
            .rpc();

        const campaignAcc = await pg.program.account.campaign.fetch(
            campaignAccount,
        );
        assert.ok(campaignAcc.amountDonated.eq(new anchor.BN(0.33 * anchor.web3.LAMPORTS_PER_SOL)));
    });

    it('Should withdraw to owner wallet', async () => {
        await pg.program.methods
            .withdraw(new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL))
            .accounts({
                campaign: campaignAccount,
                user: pg.wallet.publicKey,
            })
            .rpc();
            
        const campaignAcc = await pg.program.account.campaign.fetch(
            campaignAccount,
        );
        // Should be the same as before
        assert.ok(campaignAcc.amountDonated.eq(new anchor.BN(0.33 * anchor.web3.LAMPORTS_PER_SOL)));
    });

});