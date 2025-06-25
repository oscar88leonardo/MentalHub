// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./IWhitelist.sol";

contract MembersAirdrop is ERC721Enumerable, Ownable {
    using Strings for uint256;    
    /**
     * @dev _baseTokenURI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`.
     */
    string _baseTokenURI;
    string _gatewayTokenURI;

    //  _price is the price of one MentalHub member after claim period
    uint256 public _price = 0.01 ether;

    // _paused is used to pause the contract in case of an emergency
    bool public _paused;

    // max number of collection memebers
    uint256 public maxTokenIds = 100;

    // total number of tokenIds minted
    uint256 public tokenIds;

    // Whitelist contract instance
    IWhitelist whitelist;

    // boolean to keep track of whether presale started or not
    bool public airdropStarted;

    // timestamp for when presale would end
    uint256 public airdropEnded;

    // Agregar después de las variables de estado existentes
    mapping(uint256 => uint256) private tokenIdToSessions;


    modifier onlyWhenNotPaused() {
        require(!_paused, "Contract currently paused");
        _;
    }

    // Agregar modifier
    modifier onlyTokenOwnerOrContract(uint256 _tokenId) {
        require(
            ownerOf(_tokenId) == msg.sender || owner() == msg.sender,
            "Caller is not token owner or contract owner"
        );
        _;
    }
    
    // variable para controlar si el mint es sponsoreado
    bool public isSponsoredMint;

    // Enum para especificar la unidad de tiempo en el airdrop
    enum TimeUnit { MINUTES, DAYS }

    // Evento para tracking de mints sponsoreados
    event SponsoredMint(address indexed user , uint256 tokenId, uint256 sessions);
    event AirdropStarted(uint256 endTime, uint256 duration, uint8 timeUnit);

    /**
     * @dev ERC721 constructor takes in a `name` and a `symbol` to the token collection.
     * Constructor for Crypto Devs takes in the baseURI to set _baseTokenURI for the collection.
     * It also initializes an instance of whitelist interface.
     */
    constructor(string memory baseURI, string memory gateURI, address whitelistContract)
        ERC721("Mental Hub Members", "MHM")
    {
        _baseTokenURI = baseURI;
        _gatewayTokenURI = gateURI;
        whitelist = IWhitelist(whitelistContract);
        isSponsoredMint = true; // Por defecto, el mint es sponsoreado
    }

    function toggleSponsoredMint() public onlyOwner {
        isSponsoredMint = !isSponsoredMint;
    }

    function setbaseTokenURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    function setgatewayTokenURI(string memory gateURI) public onlyOwner {
        _gatewayTokenURI = gateURI;
    }

    function getTokenIds() public view returns (uint256) {
        return tokenIds;
    }

    function walletOfOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory ArrTokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            ArrTokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return ArrTokenIds;
    }

    /**
     * @dev Inicia el airdrop con una duración específica
     * @param _duration Duración del airdrop
     * @param _timeUnit Unidad de tiempo (0 = MINUTES, 1 = DAYS)
     * Requirements:
     * - Solo puede ser llamado por el owner
     * - La duración debe ser mayor a 0
     * - La unidad de tiempo debe ser válida (0 o 1)
     */
    function StartAirdrop(uint256 _duration, uint8 _timeUnit) public onlyOwner {
        require(_duration > 0, "Duration must be greater than 0");
        require( _timeUnit <= uint8(TimeUnit.DAYS), "Invalid time unit");
                        
        // calcular el tiempo de finalización según la unidad de tiempo
        if (_timeUnit == uint8(TimeUnit.MINUTES)) {
            airdropEnded = block.timestamp + (_duration * 1 minutes);
        } else if (_timeUnit == uint8(TimeUnit.DAYS)) {
            airdropEnded = block.timestamp + (_duration * 1 days);
        }
        // Set presaleEnded time as current timestamp + 5 minutes
        // Solidity has cool syntax for timestamps (seconds, minutes, hours, days, years)
        // airdropEnded = block.timestamp + 7 days;
        emit AirdropStarted(airdropEnded, _duration, _timeUnit);
        airdropStarted = true;

    }

    /**
     * @dev AirdropMint allows a user to mint one NFT per transaction during the airdrop at $0 mint cost.
     */
    function airdropMint(uint256 _numSessions) public payable onlyWhenNotPaused {
        require(
            airdropStarted && block.timestamp < airdropEnded,
            "Airdrop Running!"
        );
        require(
            whitelist.whitelistedAddresses(msg.sender),
            "You are not whitelisted"
        );
        require(
            tokenIds < maxTokenIds,
            "Exceeded maximum MentalHub Members supply"
        );
        //Airdrop does not require a _price
        //require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;
        //_safeMint is a safer version of the _mint function as it ensures that
        // if the address being minted to is a contract, then it knows how to deal with ERC721 tokens
        // If the address being minted to is not a contract, it works the same way as _mint
        _safeMint(msg.sender, tokenIds);
        // Actualizar el mapping con el número de sesiones
        tokenIdToSessions[tokenIds] = _numSessions;
    }

    // Función para obtener número de sesiones disponibles
    function getAvailableSessions(uint256 _tokenId) public view returns (uint256) {
        require(_exists(_tokenId), "Token ID does not exist");
        return tokenIdToSessions[_tokenId];
    }

    // Función actualizada para decrementar sesiones
    function decrementSessions(uint256 _tokenId) public onlyTokenOwnerOrContract(_tokenId) {
        require(_exists(_tokenId), "Token ID does not exist");
        require(tokenIdToSessions[_tokenId] > 0, "No sessions available");
        tokenIdToSessions[_tokenId] -= 1;
        //emit SessionsUpdated(_tokenId, tokenIdToSessions[_tokenId]);
    }

    // Función para agregar sesiones (solo owner del contrato)
    /*function addSessions(uint256 _tokenId, uint256 _sessionsToAdd) public onlyTokenOwnerOrContract(_tokenId) {
        require(_exists(_tokenId), "Token ID does not exist");
        tokenIdToSessions[_tokenId] += _sessionsToAdd;
        //emit SessionsUpdated(_tokenId, tokenIdToSessions[_tokenId]);
    }*/

    /**
     * @dev mint allows a user to mint 1 NFT per transaction after the presale has ended.
     */
    function mint(uint256 _numSessions) public payable onlyWhenNotPaused {
        require(
            airdropStarted && block.timestamp >= airdropEnded,
            "Airdrop for whitelisted users has not ended yet"
        );
        require(
            tokenIds < maxTokenIds,
            "Exceed maximum MentalHub Members supply"
        );
        
        //require(msg.value >= _price, "Ether sent is not correct");
        // veroficar si el mint es sponsoreado
        if (!isSponsoredMint) {
            require(msg.value >= _price, "Funds sent are not correct");
        }
        
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
        // Actualizar el mapping con el número de sesiones
        tokenIdToSessions[tokenIds] = _numSessions;

        if(isSponsoredMint) {
            emit SponsoredMint(msg.sender, tokenIds, _numSessions);
        }
    }

    /**
     * @dev _baseURI overides the Openzeppelin's ERC721 implementation which by default
     * returned an empty string for the baseURI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function _gatewayURI() internal view virtual  returns (string memory) {
        return _gatewayTokenURI;
    }

/**
    * @dev tokenURI overrides the Openzeppelin's ERC721 implementation for tokenURI function
    * This function returns the URI from where we can extract the metadata for a given tokenId
    */
     function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();
        // Here it checks if the length of the baseURI is greater than 0, if it is return the baseURI and attach
        // the tokenId and `.json` to it so that it knows the location of the metadata json file for a given
        // tokenId stored on IPFS
        // If baseURI is empty return an empty string
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
    }

    function gatewayURI(uint256 tokenId) public view virtual returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory gateURI = _gatewayURI();
        // Here it checks if the length of the baseURI is greater than 0, if it is return the baseURI and attach
        // the tokenId and `.json` to it so that it knows the location of the metadata json file for a given
        // tokenId stored on IPFS
        // If baseURI is empty return an empty string
        return bytes(gateURI).length > 0 ? string(abi.encodePacked(gateURI, tokenId.toString(), ".json")) : "";
    }

    /**
     * @dev setPaused makes the contract paused or unpaused
     */
    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    /**
     * @dev withdraw sends all the ether in the contract
     * to the owner of the contract
     */
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}
