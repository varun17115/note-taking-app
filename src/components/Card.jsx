const Card = ({ title, description, time, image , duration , type , date , lastModified }) => {
    return (
        <div className="border rounded-lg sm p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-500">{time}</div>
                <div className="flex items-center">
                    <span className="mr-2">{duration}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">{type}</span>
                </div>
            </div>
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            <p className="text-gray-600">{description}</p>
            {/* <div className="mt-2 text-sm text-gray-500">{date}</div> */}
            <div className="mt-2 text-sm text-gray-500">{image}</div>
            {/* <div className="mt-2 text-sm text-gray-500">{lastModified}</div> */}
        </div>
    );
};

export default Card;
