import React from 'react';
import axios from 'axios';
import { Link, withRouter } from 'react-router-dom';
import { niceDate, countDown } from '../utils/date';

class Vehicular extends React.Component {
    constructor(props) {
        super(props);
            this.state = {
                vehicleNumber: this.props.match.params.vehicleNumber ? this.props.match.params.vehicleNumber.toUpperCase() : '',
                agency: this.props.match.params.agency ? this.props.match.params.agency.toUpperCase() : 'SF'
            }

        this.loadVehicle = this.loadVehicle.bind(this)
        this.updateVehicleNumber = this.updateVehicleNumber.bind(this)
        this.updateAgency = this.updateAgency.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.selectID = this.selectID.bind(this)
    }
    selectID = (e) => e.target.select();

    componentDidMount() {
        document.title=`TransitOrb - Vehicular Tracking`
        this.loadVehicle()
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.match.params.vehicleNumber !== prevProps.match.params.vehicleNumber){
            this.loadVehicle()
        }
    }
    handleSubmit(e){
        e.preventDefault()
        this.props.history.push(`/vehicular/${this.state.agency}/${this.state.vehicleNumber}`)
        this.loadVehicle()
    }
    loadVehicle() { 
        let vehicle = { VehicleRef: this.props.match.params.vehicleNumber }
        let agency = this.state.agency.toUpperCase()
        axios.get(`https://api.511.org/transit/VehicleMonitoring?api_key=72939361-85f9-4019-aa55-d62e4e7e2e59&agency=${agency}&format=json&vehicleID=${vehicle.VehicleRef}`)
            .then(res => {
                if (res.data.Siri.ServiceDelivery.VehicleMonitoringDelivery.VehicleActivity){
                    vehicle = res.data.Siri.ServiceDelivery.VehicleMonitoringDelivery.VehicleActivity[0].MonitoredVehicleJourney
                }
                this.setState({ vehicleNumber: vehicle.VehicleRef, vehicle, agency });
                document.title=
                    `TransitOrb - Vehicular Tracking
                    ${vehicle.OperatorRef
                    ?`- ${vehicle.OperatorRef} #${vehicle.VehicleRef}`
                    :''}`
            })   
    }
    updateVehicleNumber(e) {
        return e => {
            let vehicleNumber = e.currentTarget.value
            this.setState({
                vehicleNumber
            })
        }
    }
    updateAgency(e) {
        return e => {
            let agency = e.currentTarget.value
            if (agency.length <= 2){
            this.setState({
                agency
            })}
        }
    }
    render() {
        let vehicleInfo = <div className="vehicle-info">No Tracked Vehicle</div>
        let firstStop = ''
        let gFrame
        if (this.state.vehicle && this.state.vehicle.VehicleLocation) { 
        gFrame = <iframe title="gFrame" frameBorder="1"
                src={`https://www.google.com/maps/embed/v1/place?zoom=14&q=${this.state.vehicle.VehicleLocation.Latitude},${this.state.vehicle.VehicleLocation.Longitude}&key=AIzaSyAIe8CQdaU5qYMgUBimNtNLtz6MKhODsNU`}>
                    Loading Map...
                </iframe> 
        }
        if (this.state.vehicle && this.state.vehicle.MonitoredCall) {
        vehicleInfo =
                <div className="vehicle-info">
                    <span>
                        <span className="no-gps">
                            {this.state.vehicle.LineRef}
                        </span>
                        <span className="bold">
                            {`=>`}
                        </span>
                    </span>
                    <div>
                        <span className="bold">
                            {this.state.vehicle.DestinationName}
                        </span>
                        <div>
                            <Link 
                                to={`/anystop/${this.state.agency}/${this.state.vehicle.DestinationRef}`}>
                                <div className="map-link">
                                    <span title="bus stop" role="img" aria-label="bus stop emoji">🚏</span>
                                    {this.state.vehicle.DestinationRef}
                                </div>
                            </Link> 
                        </div>
                    </div>
                </div>
        let expected
	expected = this.state.agency === 'CT'
                 ? this.state.vehicle.MonitoredCall.ExpectedDepartureTime 
                 : this.state.vehicle.MonitoredCall.ExpectedArrivalTime
        firstStop =  
            <div className="stop" >
                <div>
                    <span className="bold">
                        {this.state.vehicle.MonitoredCall.StopPointName}
                    </span>
                    <Link 
                        to={`/anystop/${this.state.agency}/${this.state.vehicle.MonitoredCall.StopPointRef}`}>
                        <div className="map-link">
                            <span title="bus stop" role="img" aria-label="bus stop emoji">🚏</span>
                            {this.state.vehicle.MonitoredCall.StopPointRef}
                        </div>
                    </Link> 
                </div>
            <hr></hr>
                <div>
                    { expected && expected !== this.state.vehicle.MonitoredCall.AimedDepartureTime
                    ? <><span className="gray">
                        {niceDate(this.state.vehicle.MonitoredCall.AimedArrivalTime)}
                    </span>
                    <span className="bold">
                        {niceDate(expected)}
                    </span></>
                    : <span className="bold">
                        Scheduled {niceDate(this.state.vehicle.MonitoredCall.AimedArrivalTime)}
                    </span> }
                    <div className="countdown">
                        { expected && expected !== this.state.vehicle.MonitoredCall.AimedDepartureTime
                        ? <div className="min-math">
                            {countDown(expected)}</div>
                        : <div className="min-math">
                            {countDown(this.state.vehicle.MonitoredCall.AimedArrivalTime)}</div> }               
                        <div className="min">min</div>
                    </div>
                </div>   
            </div>
        }
        let futureStops = <div className="future-stops"><div className="stop" >
        No Future Stops</div></div>
        let key = 0
        if (this.state.vehicle && this.state.vehicle.OnwardCalls && this.state.vehicle.OnwardCalls.OnwardCall[0]) {
        futureStops = 
            <div className="future-stops">
                {firstStop}
                {this.state.vehicle.OnwardCalls.OnwardCall.map(stop => {
                    let expected 
		    expected = this.state.agency.toUpperCase() === 'CT'
                             ? stop.ExpectedDepartureTime 
                             : stop.ExpectedArrivalTime
                    return ( 
                    <div className="stop" key={key++}>
                        <div>
                            <span className="bold">
                                {stop.StopPointName}
                            </span>
                            <Link 
                                to={`/anystop/${this.state.agency}/${stop.StopPointRef}`}>
                                <div className="map-link">
                                    <span title="bus stop" role="img" aria-label="bus stop emoji">🚏</span>
                                    {stop.StopPointRef}
                                </div>
                            </Link> 
                        </div>
                    <hr></hr>
                        <div>
                            {expected  && expected !== stop.AimedDepartureTime
                            ? <><span className="gray">
                                {niceDate(stop.AimedArrivalTime)}
                            </span>
                            <span className="bold">
                                {niceDate(expected)}
                            </span></>
                            : <span className="bold">
                                Scheduled {niceDate(stop.AimedArrivalTime)}
                            </span>}
                            <div className="countdown">
                                {expected
                                ? <div className="min-math">
                                    {countDown(expected)}</div>
                                : <div className="min-math">
                                    {countDown(stop.AimedArrivalTime)}</div>}               
                                <div className="min">min</div>
                            </div>
                        </div>   
                    </div>
                    )})}
            </div>
        }
return (
    <div className="vehicular">
        <div className="short-title">
            Vehicular Tracking
                { this.state.vehicle && this.state.vehicle.VehicleRef && this.state.vehicle.OperatorRef
                ? ` - ${this.state.vehicle.OperatorRef} #${this.state.vehicle.VehicleRef}`
                : '' }
        </div>             
        <form onSubmit={this.handleSubmit}>
            <input type="text"
                id="vehicle-agency"
                placeholder="Agency"
                value={this.state.agency}
                onFocus={this.selectID}
                onChange={this.updateAgency()}
                />
            <input type="number"
                id="vehicle-number"
                placeholder="Vehicle"
                value={this.state.vehicleNumber}
                onFocus={this.selectID}
                onChange={this.updateVehicleNumber()}
                />
            { this.state.vehicle && this.state.vehicle.Monitored
            ? <input type="submit" value="ReLoad" />
            : <input type="submit" value="Load" /> }
                <br></br>
            <a className="vehicular-feedback" href="https://www.sfmta.com/getting-around/muni/muni-feedback" target="_blank" rel="noopener noreferrer">
                SFMUNI Vehicle Numbers
            </a>
        </form>
        {vehicleInfo}
    <div className='g-frame'>
        {gFrame}
    </div> 
        {futureStops}
    </div>
);
    }
}
export default withRouter(Vehicular);
