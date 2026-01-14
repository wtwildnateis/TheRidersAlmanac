import { useEffect } from "react";

const GoogleMapsLoader = ({ onLoad }) => {
    useEffect(() => {
        if (document.getElementById("google-maps-script")) return;

        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.type = "module";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly&modules=places`;

        script.onload = () => {
            if (onLoad) onLoad();
        };

        document.head.appendChild(script);
    }, [onLoad]);

    return null;
};

export default GoogleMapsLoader;