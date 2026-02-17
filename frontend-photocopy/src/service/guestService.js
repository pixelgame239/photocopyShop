export const generateGuestName = () => {
    const adjectives = ["Happy", "Sad", "Angry", "Excited", "Lazy", "Brave", "Clever", "Shy", "Friendly", "Curious"];
    const animals = ["Cat", "Dog", "Elephant", "Lion", "Tiger", "Bear", "Monkey", "Giraffe", "Zebra", "Panda"];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    return `${randomAdjective}${randomAnimal}${randomNumber}`;
}