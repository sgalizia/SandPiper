import React, { Component } from 'react';
import './Track.css';

class TrackList extends Component {
  constructor(props){
      super(props);

      // TODO: Change this up later; we'll put it in the dashboard
      this.services = ['spotify', 'apple']
      this.state = {
          selected: [],
          submitted: [],
          trackIDs: [],
      }
      this.simpleTrackData = [];
      this.trackIDs = [];
      this.cleanedTrackData = this.props.tracks.map((track) => {
          const data = this.cleanTrackData(track);
          this.simpleTrackData.push({
              id: data.id,
              name: data.trackName,
              album: data.albumName,
              artist: data.artistName
          });
          return data;
      })
      this.playlist = this.props.playlist;

  }

  handleSubmit(event) {
      event.preventDefault();
      // For ordering purposes
      const filtered = this.state.selected.filter(content => content);
      const IDs = filtered.map(track => { return track.id })
      this.setState({ submitted: filtered, trackIDs: IDs })
  }

  addToQueue(data, index){
      let listCopy = this.state.selected.slice();

      if(listCopy[index]){
          listCopy[index] = null;
      }
      else{
          listCopy[index] = data;
      }

      this.setState({
          selected: listCopy,
          checkAll: false
      })
  }

  checkAll(event){
      event.preventDefault();
      this.setState({ checkAll: true, selected: this.simpleTrackData })
  }

  checkNone(event){
      event.preventDefault();
      this.setState({ checkAll: false, selected: [] })
  }


  cleanTrackData(track){
      let albumImage, trackName, trackUrl, artistName, artistUrl, trackData,
            id, trackEmbed, albumName;
      switch(this.props.site){
          case 'spotify':
              trackData = track.track

              id = trackData.external_ids.isrc;
              albumImage = trackData.album.images[0] ? trackData.album.images[0].url : null;
              albumName = trackData.album.name;
              trackName = trackData.name;
              trackUrl = trackData.external_urls.spotify;
              artistName = trackData.artists[0].name;
              artistUrl = trackData.artists[0].external_urls.spotify;
              trackEmbed = <iframe title={trackName} src={`https://open.spotify.com/embed?uri=${trackData.uri}`}
                            width="250" height="80" frameBorder="0" allowtransparency="true" allow="encrypted-media"/>
              break;
          case 'apple':
              trackData = track.attributes;
              id = track.id;

              albumImage = trackData.artwork.url.replace(/(\{\w\})/g, '100');
              trackName = trackData.name;
              trackUrl = null;
              artistName = trackData.artistName;
              artistUrl = null;
              break;
          default:
              return null;
      }

      return({albumImage, albumName, trackName, trackUrl, artistName, artistUrl, trackData, trackEmbed, id})
  }

  transferPrep(){
      switch(this.props.site){
          case 'spotify':
            return this.state.submitted;
          case 'apple':
            return this.state.trackIDs;
          default:
            return null;
      }
  }

  render() {
      let trackList = []

      if (this.cleanedTrackData !== undefined) {
          trackList = this.cleanedTrackData.map((data, index) => {
              return <Track site={this.props.site} key={index} checked={this.state.selected[index]}
                        index={index} add={(data, index) => this.addToQueue(data, index)} data={data}/>
          })
      }

    const playlist = this.playlist;

    let imageURL, subtitle, name, url, embed;
    switch(this.props.site){
        case 'spotify':
            name = playlist.name;
            url = playlist.external_urls.spotify
            imageURL = playlist.images[0].url;
            subtitle = (
                <div className='playlist-subtitle'>
                    <h3 className='playlist-by'>{`By: ${playlist.owner.display_name}`}</h3>
                    <h3 className='playlist-tracks'>{`${playlist.tracks.total} tracks`}</h3>
                </div>
            )
            embed = <iframe title="spotify-playlist" className='tracklist-playlist-embed' width="350" height="280" frameBorder="0"
                            src={`https://open.spotify.com/embed?uri=${playlist.uri}`} allowtransparency="true" allow="encrypted-media"/>
            break;
        case 'apple':
            name = playlist.attributes.name;
            imageURL = playlist.attributes.artwork.url.replace(/(\{\w\})/g, '150')
            subtitle = (
                <div className='playlist-subtitle'>
                    <h3 className='playlist-description'>
                        {playlist.attributes.description
                            ? playlist.attributes.description.standard
                            : null}
                    </h3>
                </div>
            )
            break;
        default:
            imageURL = null;
            break;
    }

    let selected;
    if(this.state.submitted.length > 0){
        const submitData = this.state.submitted.map((data, index) => {
            return (
                <li>
                    <div className="selected-name">{data.name}</div>
                    <div className="selected-artist">{data.artist}</div>
                </li>
            )
        })

        selected = (
            <div className="selected-tracks">
                <h2 className="selected-tracks-heading">Selected Tracks</h2>
                <ol>
                    {submitData}
                </ol>
            </div>

        )
    }
    else{
        selected = <div className="selected-tracks">
            <h2 className="no-tracks">No tracks submitted!</h2>
            <p className="no-tracks">Submit some tracks to populate!</p>
        </div>
    }

    let transferButtons = this.services.map((service) => {
        if(service !== this.props.site){
            return <button key={service} className={`playlist-transfer transfer-${service}`}
                    onClick={() => this.props.migrate({source: this.props.site, target: service}, this.transferPrep(), name)}>
                        Transfer to {service[0].toUpperCase() + service.substr(1)}
                    </button>
        }
        else{
            return null;
        }
    })

    return (
      <div className='tracklist-container'>
          <div className='tracklist-playlist'>
              <div className='tracklist-playlist-info'>
                  <div className='playlist-img-container'>
                      <img className='playlist-cover' alt='Playlist mosaic' src={imageURL}/>
                      <button onClick={this.props.reset}>Back to playlists</button>
                      {transferButtons}

                  </div>
                  <div className='playlist-heading'>
                      <h2 className='playlist-title'><a href={url}>{name}</a></h2>
                      {subtitle}
                  </div>
              </div>
              {selected}
              {embed}


          </div>
          <form className="tracklist-form" onSubmit={(ev) => this.handleSubmit(ev)}>
              <button className="tracklist-submit" type="submit">Submit</button>
              <button className="tracklist-checkAll" onClick={(ev) => this.checkAll(ev)}>Select All</button>
              <button className="tracklist-checkNone" onClick={(ev) => this.checkNone(ev)}>Reset Selection</button>

              <div className='trackList'>{trackList}</div>
          </form>
      </div>
    );
  }
}

export class Track extends Component {
  componentDidMount() {

  }

  render() {
    let trackDisplay;
    // Defunct for the time being
    // if(this.props.data.trackEmbed){
    //     trackDisplay =
    //     <div className='track-embedded'>
    //         <input className='track-check' type='checkbox' checked={this.props.checked ? true : false} name='track-select' value={this.props.data.id}
    //                 onChange={() => this.props.add({id: this.props.data.id, name: this.props.data.trackName}, this.props.index)}/>
    //         {this.props.data.trackEmbed}
    //     </div>
    // }
    // else{
        trackDisplay = (
            <div className='track'>
              <input className='track-check' type='checkbox' checked={this.props.checked ? true : false} name='track-select' value={this.props.data.id}
                      onChange={() => this.props.add({
                          id: this.props.data.id,
                          name: this.props.data.trackName,
                          album: this.props.data.albumName,
                          artist: this.props.data.artistName
                      }, this.props.index)}/>
              <div className='track-album'>
                <img src={this.props.data.albumImage} height={100} width={100} alt={'Album artwork.'}/>
              </div>
              <div className='track-details'>
                <a className='track-details-title' href={this.props.data.trackUrl} target='_blank'>{this.props.data.trackName}</a>
                <a className='track-details-artist' href={this.props.data.artistUrl} target='_blank'>{this.props.data.artistName}</a>
              </div>
            </div>
        )
    // }

    return trackDisplay;
  }
}

export default TrackList;
