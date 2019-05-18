/* eslint-disable */
import React, { Component } from 'react';
import S3FileUpload from 'react-s3';
import {ButtonToolbar, Button, Jumbotron, Collapse } from "reactstrap";


import 'video.js/dist/video-js.css';
import videojs from 'video.js';

import 'webrtc-adapter';
import RecordRTC from 'recordrtc';

/*
// the following imports are only needed when you're recording
// audio-only using the videojs-wavesurfer plugin
import WaveSurfer from 'wavesurfer.js';
import MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.js';
WaveSurfer.microphone = MicrophonePlugin;

// register videojs-wavesurfer plugin
import 'videojs-wavesurfer/dist/css/videojs.wavesurfer.css';
import Wavesurfer from 'videojs-wavesurfer/dist/videojs.wavesurfer.js';
*/

// register videojs-record plugin with this import
import 'videojs-record/dist/css/videojs.record.css';
import Record from 'videojs-record/dist/videojs.record.js';

const config = {
    bucketName: 'blackjackvideo',
    region: 'us-east-1',
    accessKeyId: '',
    secretAccessKey: ''
}


const videoJsOptions = {
    controls: false,
    width: 320,
    height: 240,
    fluid: true,
    loop:true,
    autoMuteDevice: false,
    plugins: {
        record: {
            audio: true,
            video: true,
            maxLength: 600,
            debug: true
        }
      },
    controlBar: {
      fullscreenToggle: false,
      deviceButton: false
    }
}



export default class Videos extends Component {

  constructor(props) {
      super(props);
      this.startRecord = this.startRecord.bind(this);

      this.state = {
        collapse1: true,
        collapse2: false,
        collapse3: false,
      };
    }

    toggle1(){
      this.setState(state => ({ collapse1: !state.collapse1}));
    }

    toggle2(){
      this.setState(state => ({ collapse2: !state.collapse2}));
    }

    toggle3(){
      this.setState(state => ({ collapse3: !state.collapse3}));
    }

    startRecord() {
        this.player.record().start();
        this.toggle1();
        this.toggle2();

    }

    componentDidMount() {
        // instantiate Video.js
        this.player = videojs(this.videoNode, videoJsOptions, () => {
            // print version information at startup
            var version_info = 'Using video.js ' + videojs.VERSION +
                ' with videojs-record ' + videojs.getPluginVersion('record') +
                ' and recordrtc ' + RecordRTC.version;
            videojs.log(version_info);
        });

        this.player.record().getDevice();

        // device is ready
        this.player.on('deviceReady', () => {
            console.log('device is ready!');
        });

        // user clicked the record button and started recording
        this.player.on('startRecord', () => {
            console.log('started recording!');
        });

        // user completed recording and stream is available
        this.player.on('finishRecord', () => {
            // recordedData is a blob object containing the recorded data that
            // can be downloaded by the user, stored on server etc.
            console.log('finished recording:', this.player.recordedData);
            S3FileUpload.uploadFile(this.player.recordedData, config)
            .then(data => console.log(data))
            .catch(err => console.error(err));
        });

        // error handling
        this.player.on('error', (element, error) => {
            console.warn(error);
        });

        this.player.on('deviceError', () => {
            console.error('device error:', this.player.deviceErrorCode);
        });

    }
    componentWillReceiveProps() {
      this.player = videojs(this.videoNode, this.videoJsOptions1, () => {
          // print version information at startup
          var version_info = 'Using video.js ' + videojs.VERSION +
              ' with videojs-record ' + videojs.getPluginVersion('record') +
              ' and recordrtc ' + RecordRTC.version;
          videojs.log(version_info);
      });

    }

    // destroy player on unmount
    componentWillUnmount() {
        if (this.player) {
            this.player.dispose();
        }
    }

  render() {
      return (
      <div>
        <div>
            <Collapse isOpen={this.state.collapse1}>
              <Jumbotron>
                <ButtonToolbar>
                  <a onClick={this.startRecord} className="btn btn-primary btn-lg">
                    <h1>
                    Start the Experiment.
                    </h1>
                  </a>
                </ButtonToolbar>
              </Jumbotron>
            </Collapse>

            <Collapse isOpen={this.state.collapse3}>
              <Jumbotron>
                <h1>
                  3) Stop Recording
                </h1>

                <ButtonToolbar>
                  <a onClick={this.stopRecord}  className="btn btn-primary btn-lg">
                    Stop Recording.
                  </a>
                </ButtonToolbar>
              </Jumbotron>
            </Collapse>

            <Collapse isOpen={this.state.collapse4}>
              <Jumbotron>
                <h1>
                  4) Finish the Experiment
                </h1>
                <ButtonToolbar>
                  <a onClick={this.finish_exp} className="btn btn-primary btn-lg">
                    Finish the Experiment.
                  </a>
                </ButtonToolbar>
              </Jumbotron>
            </Collapse>
        </div>
        <div data-vjs-player>
          <video id="myVideo" ref={node => this.videoNode = node} className="video-js vjs-default-skin" playsInline></video>
        </div>

      </div>


      );
  }
}
