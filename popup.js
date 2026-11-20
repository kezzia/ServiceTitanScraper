document.addEventListener('DOMContentLoaded', () => {
  loadJobData();

  // Set up the reload button
  const reloadBtn = document.getElementById('reload-btn');
  reloadBtn.addEventListener('click', () => {
    // Show temporary loading state
    document.getElementById('date').textContent = 'Loading...';
    document.getElementById('job-number').textContent = 'Loading...';
    document.getElementById('tech-name').textContent = 'Loading...';
    document.getElementById('job-customer').textContent = 'Loading...';
    
    loadJobData();
  });
});

async function loadJobData() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab) return;

  // Execute script in the active tab to extract the data
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractPageData
  }, (injectionResults) => {
    if (injectionResults && injectionResults[0]) {
      const data = injectionResults[0].result;

      const jobDateEl = document.getElementById('date');
      const jobNumberEl = document.getElementById('job-number');
      const techNameEl = document.getElementById('tech-name');
      const jobCustomerEl = document.getElementById('job-customer');

      jobDateEl.textContent = data.date;
      jobNumberEl.textContent = data.jobNumber || 'Not found';
      techNameEl.textContent = data.techName || 'Not found'; 
      jobCustomerEl.textContent = data.jobCustomer || 'Not found';

      // Set up the copy entire row button (remove old listeners by cloning or direct reference)
      const copyBtn = document.getElementById('copy-row-btn');
      
      // Replace button with a clone to avoid stacking multiple click listeners on reloads
      const newCopyBtn = copyBtn.cloneNode(true);
      copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);

      newCopyBtn.addEventListener('click', () => {
        const date = jobDateEl.textContent;
        const jobNum = jobNumberEl.textContent;
        const jobNumLink = 
          '=HYPERLINK(CONCATENATE("https://go.servicetitan.com/#/Job/Index/",' + jobNum +
             '),' + jobNum + ')';
        const techName = techNameEl.textContent;
        const customer = jobCustomerEl.textContent;

        const rowText = `${date}\t${jobNumLink}\t${techName}\t"${customer}"`;
        
        navigator.clipboard.writeText(rowText).then(() => {
          const originalText = newCopyBtn.textContent;
          newCopyBtn.textContent = 'Copied!';
          newCopyBtn.style.backgroundColor = '#28a745';
          
          setTimeout(() => {
            newCopyBtn.textContent = originalText;
            newCopyBtn.style.backgroundColor = '#007bff';
          }, 1500);
        });
      });

    } else {
      document.getElementById('job-number').textContent = 'Error';
      document.getElementById('job-customer').textContent = 'Error';
    }
  });
}

// This function runs inside the context of the web page
function extractPageData() {
  const pageText = document.body.innerText;

  const invoiceHeaderMatch = pageText.match(/Invoice\s*#\s*(\d{8})/i);
  const generalJobMatch = pageText.match(/#?(\d{8})/);
  const jobNumber = invoiceHeaderMatch ? invoiceHeaderMatch[1] : (generalJobMatch ? generalJobMatch[1] : 'Not found');

  const date = new Date().toLocaleDateString();

  const techNames = document.querySelector('.Stack.qa-appointments-technicians-list').innerText
    .replaceAll('Working', '')
    .replaceAll('Working on another job', '')
    .replaceAll('Dispatched', '')
    .replaceAll('Dispatched to another job', '')
    .replaceAll('Dispatched to another job', '')
    .replaceAll('Assigned', '')
    .replaceAll('Done', '')
    .replaceAll(/[^\x20-\x7E]/gmi, "")
    .trim();
  // TODO: Convert techs full names into names used in sheets
  // TODO: If there are multiple techs separate their names into individual chips

  let jobCustomer = 'Not found';
  
  const billToHeader = Array.from(document.querySelectorAll('td, th, div, span')).find(el => el.textContent.trim() === 'JOB CUSTOMER');
  if (billToHeader) {
    const parentContainer = billToHeader.closest('tr') || billToHeader.parentElement;
    if (parentContainer) {
      jobCustomer = parentContainer.innerText
        .replace('JOB CUSTOMER', '')
        .replace(/\$\d+\.\d{2}/g, '')
        .trim();
    }
  }

  if (!jobCustomer || jobCustomer === 'Not found') {
    const customerEl = document.querySelector('[href*="Customer"]');
    if (customerEl) {
      jobCustomer = customerEl.innerText.trim();
    }

  const customerAddressEl = document.querySelector('[href*="http://maps.google.com/"]');
    if (customerAddressEl) {
      jobCustomer += "\n" + customerAddressEl.innerText.trim();
    }
  }

  return {
    date: date,
    jobNumber: jobNumber,
    techName: techNames,
    jobCustomer: jobCustomer
  };
}
