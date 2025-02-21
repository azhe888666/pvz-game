// 游戏区域
const gameArea = document.getElementById('gameArea');
let zombies = []; // 存储僵尸的数组
let sunlight = 300; // 当前阳光数量，初始值为300
const gridSize = 50; // 每个格子的大小
const attackRange = 12 * gridSize; // 攻击范围为12个格子（横向）
let selectedPlantType = null; // 当前选择的植物类型
let gameInterval; // 游戏循环的定时器

// 植物类
class Plant {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.element = this.createElement();
        this.attackInterval = null; // 攻击定时器
        this.startAttacking(); // 开始攻击
    }

    createElement() {
        const plantElement = document.createElement('div');
        plantElement.className = 'plant ' + this.type;
        plantElement.style.left = this.x + 'px';
        plantElement.style.top = this.y + 'px';
        gameArea.appendChild(plantElement);
        return plantElement;
    }

    startAttacking() {
        if (this.type === 'peashooter') {
            this.attackInterval = setInterval(() => {
                // 只检查同一行的攻击范围
                const targetZombie = zombies.find(z => z.x < this.x + attackRange && z.x > this.x && z.y === this.y);
                if (targetZombie) {
                    this.shoot(); // 只有在有僵尸时才发射子弹
                }
            }, 1000); // 每秒检查一次
        } else if (this.type === 'sunflower') {
            // 向日葵每5秒产生阳光
            setInterval(() => {
                sunlight += 25; // 每次产生25阳光
                updateSunlightDisplay(); // 更新阳光显示
            }, 5000);
        }
    }

    shoot() {
        new Bullet(this.x + 50, this.y + 20); // 发射子弹
    }

    remove() {
        clearInterval(this.attackInterval); // 停止攻击定时器
        this.element.remove(); // 移除植物元素
    }
}

// 子弹类
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.element = this.createElement();
        this.move();
    }

    createElement() {
        const bulletElement = document.createElement('div');
        bulletElement.className = 'bullet';
        bulletElement.style.left = this.x + 'px';
        bulletElement.style.top = this.y + 'px';
        gameArea.appendChild(bulletElement);
        return bulletElement;
    }

    move() {
        const bulletInterval = setInterval(() => {
            this.x += 5; // 子弹向右移动
            this.element.style.left = this.x + 'px';

            // 检查子弹是否击中僵尸
            zombies.forEach(zombie => {
                if (this.x > zombie.x && this.x < zombie.x + 50 && this.y > zombie.y && this.y < zombie.y + 50) {
                    zombie.takeDamage(10); // 击中僵尸
                    this.element.remove(); // 移除子弹
                    clearInterval(bulletInterval); // 停止子弹移动
                }
            });

            // 如果子弹超出边界，移除子弹
            if (this.x > gameArea.clientWidth) {
                this.element.remove();
                clearInterval(bulletInterval);
            }
        }, 50);
    }
}

// 僵尸类
class Zombie {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.health = 100; // 僵尸的生命值
        this.element = this.createElement();
    }

    createElement() {
        const zombieElement = document.createElement('div');
        zombieElement.className = 'zombie';
        zombieElement.style.left = this.x + 'px';
        zombieElement.style.top = this.y + 'px';
        gameArea.appendChild(zombieElement);
        return zombieElement;
    }

    move() {
        this.x -= 1; // 僵尸向左移动
        this.element.style.left = this.x + 'px';

        // 检查僵尸是否超过植物的格子
        const plants = document.querySelectorAll('.plant');
        plants.forEach(plant => {
            const plantX = parseInt(plant.style.left); // 获取植物的X坐标
            const plantY = parseInt(plant.style.top); // 获取植物的Y坐标

            // 检查僵尸是否超过植物的格子
            if (this.x < plantX + gridSize && this.x + 50 > plantX && this.y === plantY) {
                // 僵尸超过植物的格子
                plant.remove(); // 移除植物
                this.health = 0; // 僵尸死亡
            }
        });

        if (this.x < 0) {
            alert('游戏失败！你的脑子被僵尸吃掉了！');
            clearInterval(gameInterval);
            this.showRestartOption(); // 显示重新开始选项
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.element.remove(); // 移除僵尸
            zombies = zombies.filter(z => z !== this); // 从数组中移除
        }
    }

    showRestartOption() {
        const restartButton = document.createElement('button');
        restartButton.innerText = '重新开始';
        document.body.appendChild(restartButton);
        restartButton.addEventListener('click', () => {
            location.reload(); // 重新加载页面
        });
    }
}

// 更新阳光显示
function updateSunlightDisplay() {
    const sunlightDisplay = document.getElementById('sunlightDisplay');
    sunlightDisplay.innerText = `阳光: ${sunlight}`;
}

// 初始化游戏
function initGame() {
    const sunlightDisplay = document.createElement('div');
    sunlightDisplay.id = 'sunlightDisplay';
    sunlightDisplay.innerText = `阳光: ${sunlight}`;
    document.body.appendChild(sunlightDisplay);

    // 添加0阳光的向日葵
    const zeroSunflowerButton = document.createElement('button');
    const zeroSunflowerImage = document.createElement('img');
    zeroSunflowerImage.src = 'sunflower.png'; // 向日葵图片路径
    zeroSunflowerImage.alt = '0阳光向日葵';
    zeroSunflowerImage.style.width = '50px'; // 设置图片宽度
    zeroSunflowerImage.style.height = '50px'; // 设置图片高度
    zeroSunflowerButton.appendChild(zeroSunflowerImage); // 将图片添加到按钮

    const zeroSunflowerCost = document.createElement('span');
    zeroSunflowerCost.innerText = ' (0阳光)'; // 显示阳光需求
    zeroSunflowerButton.appendChild(zeroSunflowerCost); // 将阳光需求添加到按钮
    document.body.appendChild(zeroSunflowerButton);

    const sunflowerButton = document.createElement('button');
    const sunflowerImage = document.createElement('img');
    sunflowerImage.src = 'sunflower.png'; // 向日葵图片路径
    sunflowerImage.alt = '选择向日葵';
    sunflowerImage.style.width = '50px'; // 设置图片宽度
    sunflowerImage.style.height = '50px'; // 设置图片高度
    sunflowerButton.appendChild(sunflowerImage); // 将图片添加到按钮

    const sunflowerCost = document.createElement('span');
    sunflowerCost.innerText = ' (50阳光)'; // 显示阳光需求
    sunflowerButton.appendChild(sunflowerCost); // 将阳光需求添加到按钮
    document.body.appendChild(sunflowerButton);

    const peashooterButton = document.createElement('button');
    const peashooterImage = document.createElement('img');
    peashooterImage.src = 'peashooter.png'; // 豌豆射手图片路径
    peashooterImage.alt = '选择豌豆射手';
    peashooterImage.style.width = '50px'; // 设置图片宽度
    peashooterImage.style.height = '50px'; // 设置图片高度
    peashooterButton.appendChild(peashooterImage); // 将图片添加到按钮

    const peashooterCost = document.createElement('span');
    peashooterCost.innerText = ' (100阳光)'; // 显示阳光需求
    peashooterButton.appendChild(peashooterCost); // 将阳光需求添加到按钮
    document.body.appendChild(peashooterButton);

    // 选择0阳光向日葵
    zeroSunflowerButton.addEventListener('click', () => {
        selectedPlantType = 'zeroSunflower'; // 选择0阳光向日葵
    });

    sunflowerButton.addEventListener('click', () => {
        selectedPlantType = 'sunflower'; // 选择向日葵
    });

    peashooterButton.addEventListener('click', () => {
        selectedPlantType = 'peashooter'; // 选择豌豆射手
    });

    // 在游戏区域点击放置植物
    gameArea.addEventListener('click', (event) => {
        const rect = gameArea.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / gridSize) * gridSize; // 计算放置位置
        const y = Math.floor((event.clientY - rect.top) / gridSize) * gridSize; // 计算放置位置

        if (selectedPlantType) {
            if (selectedPlantType === 'zeroSunflower') {
                // 选择0阳光的向日葵，点击草地生成僵尸
                const zombie = new Zombie(x + 50, y); // 在点击的格子生成僵尸
                zombies.push(zombie);
                selectedPlantType = null; // 放置后重置选择
            } else if (selectedPlantType === 'sunflower') {
                if (sunlight >= 50) { // 检查阳光是否足够
                    sunlight -= 50; // 放置向日葵时减少阳光
                    new Plant(selectedPlantType, x, y);
                } else {
                    alert('阳光不足，无法种植向日葵！');
                }
                selectedPlantType = null; // 放置后重置选择
            } else if (selectedPlantType === 'peashooter') {
                if (sunlight >= 100) { // 检查阳光是否足够
                    sunlight -= 100; // 放置豌豆射手时减少阳光
                    new Plant(selectedPlantType, x, y);
                } else {
                    alert('阳光不足，无法种植豌豆射手！');
                }
                selectedPlantType = null; // 放置后重置选择
            }
            updateSunlightDisplay(); // 更新阳光显示
        } else {
            // 如果没有选择植物，生成僵尸
            const zombie = new Zombie(x + 50, y); // 在点击的格子生成僵尸
            zombies.push(zombie);
        }
    });

    // 定时生成阳光
    setInterval(() => {
        sunlight += 25; // 每次生成25阳光
        updateSunlightDisplay(); // 更新阳光显示
    }, 5000); // 每5秒生成一次阳光

    // 定时生成僵尸
    setInterval(() => {
        const randomY = Math.floor(Math.random() * (gameArea.clientHeight / gridSize)) * gridSize; // 随机生成Y坐标
        const zombie = new Zombie(550, randomY); // 在随机Y坐标生成僵尸
        zombies.push(zombie);
    }, 5000); // 将时间间隔改为5000毫秒（5秒）

    // 僵尸移动
    gameInterval = setInterval(() => {
        zombies.forEach(zombie => zombie.move());
    }, 100);
}

initGame();