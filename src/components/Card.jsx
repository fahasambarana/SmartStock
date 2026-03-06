// eslint-disable-next-line no-unused-vars
const Card = ({ title, value, iconComponent: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
      <div className={`${colorClasses[color]} text-white p-3 rounded-full mr-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default Card;