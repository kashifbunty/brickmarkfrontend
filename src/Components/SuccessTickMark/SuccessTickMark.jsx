const SuccessTickMark = () => {
    return (
      <div className="container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="svgSuccess"
          viewBox="0 0 24 24"
        >
          <g strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10">
            <circle className="successCircleOutline" cx="12" cy="12" r="11.5" />
            <circle className="successCircleFill" cx="12" cy="12" r="11.5" />
            <polyline className="successTick" points="17,8.5 9.5,15.5 7,13" />
          </g>
        </svg>
  
        <style jsx>{`
          .container {
            width: 300px;
            margin: 50px auto;
          }
  
          .svgSuccess {
            display: inline-block;
            vertical-align: top;
            height: 300px;
            width: 300px;
            opacity: 1;
            overflow: visible;
          }
  
          .successTick {
            fill: none;
            stroke-width: 1px;
            stroke: var(--primary-color, #ffffff);
            stroke-dasharray: 15px, 15px;
            stroke-dashoffset: -14px;
            animation: success-tick 450ms ease 1400ms forwards;
            opacity: 0;
          }
  
          .successCircleOutline {
            fill: none;
            stroke-width: 1px;
            stroke: var(--primary-color, #81c038);
            stroke-dasharray: 72px, 72px;
            stroke-dashoffset: 72px;
            animation: success-circle-outline 300ms ease-in-out 800ms forwards;
            opacity: 0;
          }
  
          .successCircleFill {
            fill: var(--primary-color, #81c038);
            stroke: none;
            opacity: 0;
            animation: success-circle-fill 300ms ease-out 1100ms forwards;
          }
  
          @keyframes success-tick {
            0% {
              stroke-dashoffset: 16px;
              opacity: 1;
            }
            100% {
              stroke-dashoffset: 31px;
              opacity: 1;
            }
          }
  
          @keyframes success-circle-outline {
            0% {
              stroke-dashoffset: 72px;
              opacity: 1;
            }
            100% {
              stroke-dashoffset: 0px;
              opacity: 1;
            }
          }
  
          @keyframes success-circle-fill {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
  
          @media screen and (-ms-high-contrast: active), screen and (-ms-high-contrast: none) {
            .successTick {
              stroke-dasharray: 0;
              stroke-dashoffset: 0;
              animation: none;
              opacity: 1;
            }
  
            .successCircleOutline {
              stroke-dasharray: 0;
              stroke-dashoffset: 0;
              animation: none;
              opacity: 1;
            }
  
            .successCircleFill {
              animation: none;
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  };
  
  export default SuccessTickMark;
  