//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./Project.sol";

contract ProjectFactory {
    event ProjectCreated(address indexed newProject, address indexed creator, uint256 indexed projectId);

    Project[] public projects;
    mapping(address => uint256[]) public creatorAndProjects;

    function create(string memory _name, string memory _tokenSymbol, string memory _description, uint256 _fundingGoal) external {
        Project newProject = new Project(_name, _description, _tokenSymbol, _fundingGoal, msg.sender);

        uint256 projectId = projects.length;
        projects.push(newProject);
        creatorAndProjects[msg.sender].push(projectId);

        emit ProjectCreated(address(newProject), msg.sender, projectId);
    }
}
