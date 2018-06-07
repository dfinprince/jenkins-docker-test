'use strict';

module.exports = function(Filerequest) {
  Filerequest.validatesInclusionOf('status',
    {
      in: ['Inactive',
        'Open',
        'Submitted',
        'Under Review',
        'Certified',
        'Closed'],
      message: {in: 'status must be one of ' +
      '"Inactive","Open","Submitted","Under Review","Certified","Closed"',
      }});
};
