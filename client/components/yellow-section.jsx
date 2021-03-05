import React from 'react';

export default function YellowSection(props) {
  return (
    <div className="pt-5 mt-auto mb-0 mx-0 overflow-hidden">
      <div className="yellow-round-top position-relative pt-5 d-flex justify-content-center overflow-hidden text-center">
        <div className="yellow-contents mb-3">
          {props.children}
        </div>
      </div>
    </div>
  );
}
