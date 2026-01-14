export const handleValidation = (e,  message) => {
    e.target.setCustomValidity(message);
};

export const clearValidation = (e) => {
    e.target.setCustomValidity("");
};
