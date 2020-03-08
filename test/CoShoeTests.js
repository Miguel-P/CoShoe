// imports
const truffleAssert = require('truffle-assertions');

const CoShoe = artifacts.require("./CoShoe.sol");

contract('CoShoe', function(accounts) {

  let CoShoeInstance

  // setup and tear-down
  beforeEach(async function () {
    /// note that we make accounts[0] the minter
    CoShoeInstance = await CoShoe.new({from: accounts[0]})
  })
    
  // Test 1: Ensure that 100 tokens are minted upon deployment
  it('Should mint 100 shoe tokens for the minter upon deployment', async function () {
    let ownShoesArray = await CoShoeInstance.checkPurchase({from: accounts[5]})
    assert.equal(100, ownShoesArray.length, "Incorrect number of shoes minted upon deployment.")
  })

  // Test 2: Ensure that buyShoe reverts if the price is not equal to 0.5 ether.
  it('Ensure that buyShoe reverts if msg.value too low', async function () {
    truffleAssert.fails(CoShoeInstance.buyShoe("myShoe", "coolShoe.png", {from: accounts[2], value: web3.utils.toWei("0.1", "ether")}))
    truffleAssert.fails(CoShoeInstance.buyShoe("myShoe", "coolShoe.png", {from: accounts[2], value: web3.utils.toWei("10", "ether")}))
  })

  // Ensure that a shoe can be correctly purchased if the price is correct
  it('Must correctly handle the sale of a shoe if the price is right', async function () {
    let receipt = await CoShoeInstance.buyShoe("myShoe", "coolShoe.png", {from: accounts[1], value: web3.utils.toWei("0.5", "ether")})
    truffleAssert.eventEmitted(receipt, "ShoePurchase", (ev) => {
      return (ev._owner == accounts[1].toString() && ev._name == "myShoe" && ev._image == "coolShoe.png" && ev._shoesSold.toString() == 1)
    }, 'Purhcasing a shoe should fire an event indicating that the correct parameters where set on purchase.');
  })

  // Test 3: Ensure checkPurchase returns the correct number of ​ true​s
  it('Should return the correct number of true and falses in checkPurchase result', async function () {
    // Check that the minter owns all of the original tokens created at deployment
    let minterShoesArray = await CoShoeInstance.checkPurchase({from: accounts[0]})
    console.log(typeof minterShoesArray[1]);
    expect(minterShoesArray).to.be.an('array').that.does.not.include(false);

    // Check that the buyShoe function transfers ownership correctly
    await CoShoeInstance.buyShoe("myShoe", "coolShoe.png", {from: accounts[3], value: web3.utils.toWei("0.5", "ether")})
    let ownersArray = await CoShoeInstance.checkPurchase({from: accounts[3]})
    expect(ownersArray).to.be.an('array').that.does.include(true);
    /// check that a random account who hasn't purchased anyhting doesn't have any trues in their checkPurchase vector
    let ownersArray2 = await CoShoeInstance.checkPurchase({from: accounts[8]})
    expect(ownersArray2).to.be.an('array').that.does.not.include(true);
  })
})
