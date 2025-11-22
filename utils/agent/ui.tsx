const WeatherComponent = (props: { city: string }) => {
  return <div>Weather for {props.city}</div>;
};

const  ComponentMap = {
  weather: WeatherComponent,
};

export default ComponentMap;



