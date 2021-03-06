import React from 'react';
import AnyStop from './anyStop';

function DA() {
  return (
        <div className='transit-on'>
            <AnyStop agency='BA' stopCode='NBRK' />
            <AnyStop agency='AC' stopCode='56144' />
            <AnyStop agency='AC' stopCode='55327' />
            <AnyStop agency='AC' stopCode='59600' />
            <AnyStop agency='AC' stopCode='55165' />
        </div>
  );
}

export default DA;
