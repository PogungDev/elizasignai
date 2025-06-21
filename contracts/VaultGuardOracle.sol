// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Simplified version for local development without Chainlink dependencies
contract VaultGuardOracle {
    struct Vault {
        address owner;
        uint256 collateralAmount;
        uint256 debtAmount;
        uint256 liquidationThreshold; // in basis points (e.g., 8000 = 80%)
        bool isActive;
        uint256 lastUpdateTime;
    }
    
    struct PriceAlert {
        uint256 targetPrice;
        bool isAbove; // true for above, false for below
        bool isTriggered;
        uint256 timestamp;
    }
    
    mapping(address => Vault) public vaults;
    mapping(address => uint256) public vaultScores;
    mapping(address => PriceAlert[]) public priceAlerts;
    mapping(address => bool) public authorizedAgents;
    
    address[] public vaultOwners;
    address public owner;
    uint256 public constant LIQUIDATION_BUFFER = 500; // 5% buffer
    uint256 public mockPrice = 2000 * 10**8; // Mock ETH price at $2000
    
    event VaultCreated(address indexed owner, uint256 collateral, uint256 debt);
    event LiquidationWarning(address indexed owner, uint256 currentLTV, uint256 threshold);
    event PriceAlertTriggered(address indexed user, uint256 price, bool isAbove);
    event AutoRebalance(address indexed owner, uint256 newCollateral);
    event AgentAuthorized(address indexed agent);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorizedAgent() {
        require(authorizedAgents[msg.sender], "Not authorized agent");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedAgents[msg.sender] = true;
    }
    
    function authorizeAgent(address _agent) external onlyOwner {
        authorizedAgents[_agent] = true;
        emit AgentAuthorized(_agent);
    }
    
    function createVault(
        uint256 _collateralAmount,
        uint256 _debtAmount,
        uint256 _liquidationThreshold
    ) external {
        require(_liquidationThreshold > 5000 && _liquidationThreshold < 9500, "Invalid threshold");
        
        vaults[msg.sender] = Vault({
            owner: msg.sender,
            collateralAmount: _collateralAmount,
            debtAmount: _debtAmount,
            liquidationThreshold: _liquidationThreshold,
            isActive: true,
            lastUpdateTime: block.timestamp
        });
        
        vaultOwners.push(msg.sender);
        emit VaultCreated(msg.sender, _collateralAmount, _debtAmount);
    }
    
    function setMockPrice(uint256 _price) external onlyOwner {
        mockPrice = _price;
    }
    
    function getLatestPrice() public view returns (int256, uint256) {
        return (int256(mockPrice), block.timestamp);
    }
    
    function calculateLTV(address _owner) public view returns (uint256) {
        Vault memory vault = vaults[_owner];
        if (vault.collateralAmount == 0) return 0;
        
        (int256 price,) = getLatestPrice();
        uint256 collateralValue = vault.collateralAmount * uint256(price) / 1e8;
        
        return (vault.debtAmount * 10000) / collateralValue;
    }
    
    function checkLiquidationRisk(address _owner) public view returns (bool, uint256) {
        uint256 currentLTV = calculateLTV(_owner);
        Vault memory vault = vaults[_owner];
        
        bool atRisk = currentLTV >= (vault.liquidationThreshold - LIQUIDATION_BUFFER);
        return (atRisk, currentLTV);
    }
    
    function updateVaultScore(address _vault, uint256 _score) external onlyOwner {
        require(_score <= 100, "Score must be <= 100");
        vaultScores[_vault] = _score;
    }
    
    function setPriceAlert(uint256 _targetPrice, bool _isAbove) external {
        priceAlerts[msg.sender].push(PriceAlert({
            targetPrice: _targetPrice,
            isAbove: _isAbove,
            isTriggered: false,
            timestamp: block.timestamp
        }));
    }
    
    function updateVault(uint256 _collateralAmount, uint256 _debtAmount) external {
        require(vaults[msg.sender].isActive, "Vault not active");
        
        vaults[msg.sender].collateralAmount = _collateralAmount;
        vaults[msg.sender].debtAmount = _debtAmount;
        vaults[msg.sender].lastUpdateTime = block.timestamp;
    }
    
    function getVaultInfo(address _owner) external view returns (
        uint256 collateral,
        uint256 debt,
        uint256 ltv,
        uint256 threshold,
        bool isActive,
        uint256 lastUpdate
    ) {
        Vault memory vault = vaults[_owner];
        return (
            vault.collateralAmount,
            vault.debtAmount,
            calculateLTV(_owner),
            vault.liquidationThreshold,
            vault.isActive,
            vault.lastUpdateTime
        );
    }
}
