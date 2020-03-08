/*
    Name: PRRMIG001, Miguel Fidel Pereira
    Coding Week assignment
*/

// compiler directives
pragma solidity >= 0.5.0 <0.6.4;

// imports

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
// import '@openzeppelin/contracts/utils/ReentranceGuard.sol'; // may not need this

/// @title A non-fungible token representation of Co's stylish custom shoes
/// @author Miguel Pereira, PRRMIG001
contract CoShoe {
    using SafeMath for uint256;

    struct Shoe {
        address owner;
        bool sold;
        string image;
        string name;
    }
   Shoe[] private shoes;

    address public minter; // define a minter for the contract
    uint price = 0.5 * (1 * 10**18); // set the price in Wei
    uint256 shoesSold = 0;

    constructor() public {
        minter = msg.sender;
        // create 100 shoes and gift them to the minter
        for (int i = 0; i < 100; i++){
            shoes.push(Shoe(msg.sender, false, "", ""));
        }
    }

    /// Allows a user to purchase their own custom shoe
    /// @param _name        name to appear on shoe
    /// @param _image       picture to appear on side of shoe
    function buyShoe(string calldata _name, string calldata _image) external payable returns (bool) {
        require (shoes.length > shoesSold, "Sorry, all sold out");
        require (msg.value == price, "Not enough wei to purchase shoe");
        // effects
        shoesSold = shoesSold.add(1);
        // assign the first available shoe to the new owner
        shoes[shoesSold - 1].sold = true;
        shoes[shoesSold - 1].owner = msg.sender;
        shoes[shoesSold - 1].name = _name;
        shoes[shoesSold - 1].image = _image;
        emit ShoePurchase(msg.sender, _name, _image, shoesSold);
        return true;
    }

    /// Returns an array showing which of the shoes in the shoes array belong to msg.sender
    function checkPurchase() external view returns (bool[] memory) {
        Shoe[] memory shoeArray = new Shoe[](shoes.length); // make a copy of this array to save gas. Must be dynamically sized.
        shoeArray = shoes;
        bool[] memory output = new bool[](shoeArray.length);
        for (uint i = 0; i < shoeArray.length; i++){
            if (msg.sender == shoeArray[i].owner){
                output[i] = true;
            }
            else {
                output[i] = false;
            }
        }
        return output;
    }

    // create an event to fire off when a shoe is purchase
    event ShoePurchase (
        address _owner,
        string _name,
        string _image,
        uint256 _shoesSold
    );
}