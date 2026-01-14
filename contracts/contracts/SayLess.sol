// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SayLess {
    
    // ============ STATE ============
    
    struct Report {
        bytes32 cidHash;
        bytes32 sessionHash;
        address reporter;
        uint256 timestamp;
        uint8 status; // 0=Pending, 1=Verified, 2=Rejected
    }
    
    Report[] public reports;
    
    // Reputation per wallet (can go negative)
    mapping(address => int256) public reputation;
    
    // Reward balance per wallet
    mapping(address => uint256) public rewards;
    
    // Total rewards pool
    uint256 public rewardPool;
    
    // ============ EVENTS ============
    
    event ReportSubmitted(uint256 indexed id, bytes32 cidHash, bytes32 sessionHash, address reporter);
    event ReportVerified(uint256 indexed id, address reporter, uint256 reward);
    event ReportRejected(uint256 indexed id, address reporter);
    event RewardSent(address indexed to, uint256 amount);
    event RewardSlashed(address indexed wallet, uint256 amount);
    event ReputationUpdated(address indexed wallet, int256 newReputation);
    event PoolFunded(uint256 amount);
    
    // ============ CORE FUNCTIONS (NO ACCESS CONTROL) ============
    
    // Submit a report - anyone can call
    function submitReport(bytes32 _cidHash, bytes32 _sessionHash, address _reporter) external {
        uint256 id = reports.length;
        reports.push(Report({
            cidHash: _cidHash,
            sessionHash: _sessionHash,
            reporter: _reporter,
            timestamp: block.timestamp,
            status: 0
        }));
        emit ReportSubmitted(id, _cidHash, _sessionHash, _reporter);
    }
    
    // Verify a report - anyone can call
    function verifyReport(uint256 _id, uint256 _rewardAmount) external {
        Report storage r = reports[_id];
        r.status = 1;
        
        // Add reward to reporter's balance
        rewards[r.reporter] += _rewardAmount;
        
        // Increase reputation
        reputation[r.reporter] += 1;
        
        emit ReportVerified(_id, r.reporter, _rewardAmount);
        emit ReputationUpdated(r.reporter, reputation[r.reporter]);
    }
    
    // Reject a report - anyone can call
    function rejectReport(uint256 _id) external {
        Report storage r = reports[_id];
        r.status = 2;
        
        // Decrease reputation
        reputation[r.reporter] -= 1;
        
        emit ReportRejected(_id, r.reporter);
        emit ReputationUpdated(r.reporter, reputation[r.reporter]);
    }
    
    // Send reward to any address - anyone can call
    function sendReward(address _to, uint256 _amount) external {
        require(address(this).balance >= _amount, "Not enough ETH");
        payable(_to).transfer(_amount);
        emit RewardSent(_to, _amount);
    }
    
    // Claim accumulated rewards - anyone can call for any address
    function claimRewards(address _wallet) external {
        uint256 amount = rewards[_wallet];
        require(amount > 0, "No rewards");
        require(address(this).balance >= amount, "Not enough ETH");
        
        rewards[_wallet] = 0;
        payable(_wallet).transfer(amount);
        emit RewardSent(_wallet, amount);
    }
    
    // Slash rewards (just reduces balance) - anyone can call
    function slashReward(address _wallet, uint256 _amount) external {
        if (rewards[_wallet] >= _amount) {
            rewards[_wallet] -= _amount;
        } else {
            rewards[_wallet] = 0;
        }
        reputation[_wallet] -= 1;
        emit RewardSlashed(_wallet, _amount);
        emit ReputationUpdated(_wallet, reputation[_wallet]);
    }
    
    // Update reputation directly - anyone can call
    function setReputation(address _wallet, int256 _reputation) external {
        reputation[_wallet] = _reputation;
        emit ReputationUpdated(_wallet, _reputation);
    }
    
    // Add to reputation - anyone can call
    function addReputation(address _wallet, int256 _amount) external {
        reputation[_wallet] += _amount;
        emit ReputationUpdated(_wallet, reputation[_wallet]);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getReportCount() external view returns (uint256) {
        return reports.length;
    }
    
    function getReport(uint256 _id) external view returns (
        bytes32 cidHash,
        bytes32 sessionHash,
        address reporter,
        uint256 timestamp,
        uint8 status
    ) {
        Report memory r = reports[_id];
        return (r.cidHash, r.sessionHash, r.reporter, r.timestamp, r.status);
    }
    
    function getReputation(address _wallet) external view returns (int256) {
        return reputation[_wallet];
    }
    
    function getRewards(address _wallet) external view returns (uint256) {
        return rewards[_wallet];
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // ============ RECEIVE ETH ============
    
    receive() external payable {
        rewardPool += msg.value;
        emit PoolFunded(msg.value);
    }
    
    fallback() external payable {
        rewardPool += msg.value;
        emit PoolFunded(msg.value);
    }
}


