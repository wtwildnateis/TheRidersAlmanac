import './Button.css';

const Button = ({ type = "button", onClick, children, className = "", ...props }) => {
    return (
        <button
        type={type}
        onClick={onClick}
        className={`custom-button ${className}`}
        {...props}
        >
        {children}
        </button>
    );
};

export default Button;