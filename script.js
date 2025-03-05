import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Project data
const projects = [
    {
        id: 1,
        name: "This Minigame Idea Does Not Exist",
        url: "https://websim.ai/@api/this-minigame-idea-does-not-exist",
        thumbnail: createThumbnail("Minigame", "#FF5733")
    },
    {
        id: 2,
        name: "This Programming Language Does Not Exist",
        url: "https://websim.ai/@api/this-programming-language-does-not-exist",
        thumbnail: createThumbnail("Programming", "#33FF57")
    },
    {
        id: 3,
        name: "This Date Does Not Exist",
        url: "https://websim.ai/@api/this-date-does-not-exist",
        thumbnail: createThumbnail("Date", "#3357FF")
    },
    {
        id: 4,
        name: "This Soda Does Not Exist",
        url: "https://websim.ai/@api/this-soda-does-not-exist",
        thumbnail: createThumbnail("Soda", "#FF33A8")
    },
    {
        id: 5,
        name: "This Cat Does Not Exist",
        url: "https://websim.ai/@api/this-cat-does-not-exist",
        thumbnail: createThumbnail("Cat", "#33FFF3")
    },
    {
        id: 6,
        name: "This Wireframe Does Not Exist",
        url: "https://websim.ai/@api/this-wireframe-does-not-exist/1",
        thumbnail: createThumbnail("Wireframe", "#F3FF33")
    },
    {
        id: 7,
        name: "This Classic Arcade Game Does Not Exist",
        url: "https://websim.ai/@api/this-classic-arcade-game-does-not-exist/",
        thumbnail: createThumbnail("Arcade", "#FF3333")
    },
    {
        id: 8,
        name: "This Slideshow Cartoon Does Not Exist",
        url: "https://websim.ai/@api/this-slideshow-cartoon-does-not-exist",
        thumbnail: createThumbnail("Cartoon", "#33FF33")
    },
    {
        id: 9,
        name: "This Fridge Does Not Exist",
        url: "https://websim.ai/@api/this-fridge-does-not-exist/",
        thumbnail: createThumbnail("Fridge", "#3333FF")
    },
    {
        id: 10,
        name: "This Planet Does Not Exist",
        url: "https://websim.ai/@api/this-planet-does-not-exist",
        thumbnail: createThumbnail("Planet", "#FFB533")
    },
    {
        id: 11,
        name: "This Tetris Game Does Not Exist",
        url: "https://websim.ai/@api/this-tetris-game-does-not-exist",
        thumbnail: createThumbnail("Tetris", "#FF33F3")
    },
    {
        id: 12,
        name: "This Snake Game Does Not Exist",
        url: "https://websim.ai/@api/this-snake-game-does-not-exist",
        thumbnail: createThumbnail("Snake", "#33FFB5")
    }
];

// Create SVG thumbnails since we can't load external images
function createThumbnail(text, color) {
    const svg = `
    <svg width="80" height="60" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}" />
        <text x="50%" y="50%" font-family="Arial" font-size="12" fill="white" 
              text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Three.js setup
let scene, camera, renderer, controls;
let elevator, elevatorInterior, elevatorDoors, currentFloor = 0;
let elevatorPanel, iframeContainer, loadingScreen;
let isMoving = false;
let targetFloor = null;

// DOM elements
const buttonGrid = document.querySelector('.button-grid');
const projectFrame = document.getElementById('projectFrame');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const closeIframeBtn = document.getElementById('closeIframeBtn');
const closeButton = document.getElementById('closeButton');

// Initialize the application
init();
createElevatorButtons();

function init() {
    // Get DOM elements
    elevatorPanel = document.getElementById('elevatorPanel');
    iframeContainer = document.getElementById('iframeContainer');
    loadingScreen = document.getElementById('loadingScreen');
    
    // Initialize ThreeJS scene
    initThreeJS();
    
    // Event listeners
    closeButton.addEventListener('click', () => {
        elevatorPanel.style.display = 'none';
    });
    
    closeIframeBtn.addEventListener('click', closeIframe);
    
    fullscreenBtn.addEventListener('click', () => {
        if (projectFrame.requestFullscreen) {
            projectFrame.requestFullscreen();
        } else if (projectFrame.webkitRequestFullscreen) {
            projectFrame.webkitRequestFullscreen();
        } else if (projectFrame.msRequestFullscreen) {
            projectFrame.msRequestFullscreen();
        }
    });
    
    // Handle resize events
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
}

function initThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 2;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('elevatorScene').appendChild(renderer.domElement);
    
    // Create lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;
    
    // Create elevator
    createElevator();
    
    // Create control panel button
    createControlPanelButton();
}

function createElevator() {
    // Create elevator group
    elevator = new THREE.Group();
    scene.add(elevator);
    
    // Elevator shaft
    const shaftGeometry = new THREE.BoxGeometry(3, 30, 3);
    const shaftMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, transparent: true, opacity: 0.3 });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = 10;
    scene.add(shaft);
    
    // Elevator cabin
    const cabinGeometry = new THREE.BoxGeometry(2.5, 3, 2.5);
    const cabinMaterial = new THREE.MeshPhongMaterial({ color: 0x777777 });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    elevator.add(cabin);
    
    // Elevator interior
    const interiorGeometry = new THREE.BoxGeometry(2.3, 2.8, 2.3);
    const interiorMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
    elevatorInterior = new THREE.Mesh(interiorGeometry, interiorMaterial);
    elevatorInterior.position.y = 0;
    elevator.add(elevatorInterior);
    
    // Elevator doors (open by default)
    elevatorDoors = new THREE.Group();
    
    const doorGeometry = new THREE.BoxGeometry(1.15, 2.5, 0.1);
    const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
    
    const leftDoor = new THREE.Mesh(doorGeometry, doorMaterial);
    leftDoor.position.x = -0.575;
    leftDoor.position.z = 1.2;
    
    const rightDoor = new THREE.Mesh(doorGeometry, doorMaterial);
    rightDoor.position.x = 0.575; 
    rightDoor.position.z = 1.2;
    
    elevatorDoors.add(leftDoor);
    elevatorDoors.add(rightDoor);
    elevator.add(elevatorDoors);
    
    // Floor indicator
    const indicatorGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.1);
    const indicatorMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    indicator.position.set(0, 1.2, 1.3);
    elevator.add(indicator);
    
    // Position elevator at ground floor
    elevator.position.y = 0;
}

function createControlPanelButton() {
    const buttonGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
    const buttonMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.set(0.9, 0.5, 1.1);
    
    // Make the button interactive
    button.userData = { clickable: true };
    
    elevator.add(button);
    
    // Add a raycaster for interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    renderer.domElement.addEventListener('click', (event) => {
        // Calculate mouse position in normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Update the raycaster with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);
        
        // Calculate objects intersecting the ray
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        for (let i = 0; i < intersects.length; i++) {
            const object = intersects[i].object;
            
            // Check if we clicked the button
            if (object === button || (object.parent && object.parent === button)) {
                elevatorPanel.style.display = 'block';
                break;
            }
        }
    });
}

function createElevatorButtons() {
    buttonGrid.innerHTML = '';
    
    projects.forEach((project) => {
        const button = document.createElement('button');
        button.className = 'floor-button';
        
        // Set button content
        button.innerHTML = `
            <img src="${project.thumbnail}" alt="${project.name}">
            <div class="floor-number">Floor ${project.id}</div>
            <div class="floor-name">${project.name}</div>
            <div class="prompt-badge">
                <div class="prompt-circle">1</div>
                prompt
            </div>
        `;
        
        button.addEventListener('click', () => {
            moveToFloor(project.id - 1, project);
            elevatorPanel.style.display = 'none';
        });
        
        buttonGrid.appendChild(button);
    });
}

function moveToFloor(floorNumber, project) {
    if (isMoving) return;
    if (floorNumber === currentFloor) {
        openDoors();
        return;
    }
    
    isMoving = true;
    targetFloor = floorNumber;
    
    // Show loading screen
    loadingScreen.style.display = 'flex';
    document.querySelector('#loadingScreen .floor-number').textContent = floorNumber + 1;
    document.querySelector('.elevator-doors').classList.add('loading');
    
    // Close elevator doors first
    closeDoors().then(() => {
        // Calculate target Y position (each floor is 3 units apart)
        const targetY = floorNumber * 3;
        
        // Animate elevator movement
        const startY = elevator.position.y;
        const distanceY = targetY - startY;
        const duration = Math.abs(distanceY) * 300; // Speed of elevator movement
        const startTime = Date.now();
        
        function moveElevator() {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            elevator.position.y = startY + distanceY * progress;
            
            if (progress < 1) {
                requestAnimationFrame(moveElevator);
            } else {
                currentFloor = floorNumber;
                loadIframe(project);
                
                // Remove the loading class after the animation is complete
                setTimeout(() => {
                    document.querySelector('.elevator-doors').classList.remove('loading');
                    loadingScreen.style.display = 'none';
                    openDoors();
                }, 500);
            }
        }
        
        moveElevator();
    });
}

function openDoors() {
    return new Promise(resolve => {
        // Animation for opening doors
        const leftDoor = elevatorDoors.children[0];
        const rightDoor = elevatorDoors.children[1];
        
        const startTime = Date.now();
        const duration = 1000;
        
        function animateDoors() {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Move doors outward
            leftDoor.position.x = -0.575 - progress * 0.5;
            rightDoor.position.x = 0.575 + progress * 0.5;
            
            if (progress < 1) {
                requestAnimationFrame(animateDoors);
            } else {
                isMoving = false;
                resolve();
            }
        }
        
        animateDoors();
    });
}

function closeDoors() {
    return new Promise(resolve => {
        // Animation for closing doors
        const leftDoor = elevatorDoors.children[0];
        const rightDoor = elevatorDoors.children[1];
        
        const startLeftX = leftDoor.position.x;
        const startRightX = rightDoor.position.x;
        const targetLeftX = -0.575;
        const targetRightX = 0.575;
        
        const startTime = Date.now();
        const duration = 1000;
        
        function animateDoors() {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Move doors inward
            leftDoor.position.x = startLeftX + (targetLeftX - startLeftX) * progress;
            rightDoor.position.x = startRightX + (targetRightX - startRightX) * progress;
            
            if (progress < 1) {
                requestAnimationFrame(animateDoors);
            } else {
                resolve();
            }
        }
        
        animateDoors();
    });
}

function loadIframe(project) {
    // Set iframe src to project URL
    projectFrame.src = project.url;
    
    // Show iframe when doors open
    projectFrame.onload = () => {
        iframeContainer.style.display = 'block';
    };
}

function closeIframe() {
    iframeContainer.style.display = 'none';
    projectFrame.src = 'about:blank';
    closeDoors();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

