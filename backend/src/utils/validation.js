export const validateMauritaniaPhone = (phone) => {
  let cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');

  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('222')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.length === 8) {
      cleaned = '+222' + cleaned;
    } else {
      cleaned = '+222' + cleaned.replace(/^0+/, '');
    }
  }

  const mauritaniaRegex = /^\+222[2-7][0-9]{7}$/;

  if (!mauritaniaRegex.test(cleaned)) {
    return {
      valid: false,
      error: 'Le numéro doit être au format +222XXXXXXXX (ex: +22232123456)',
    };
  }

  const operatorCode = cleaned.substring(4, 5);
  let operator = 'other';

  if (operatorCode === '2' || operatorCode === '3') {
    operator = 'bankily';
  } else if (operatorCode === '4') {
    operator = 'masrivie';
  } else if (operatorCode === '6' || operatorCode === '7') {
    operator = 'sedad';
  }

  return {
    valid: true,
    operator,
    formatted: cleaned,
  };
};
