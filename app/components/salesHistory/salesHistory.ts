import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Transaction }   from '../../service/transaction'
import { Service }       from '../../service/service';

@Component({
	selector: 'sales-history',
	templateUrl: 'app/components/salesHistory/salesHistory.html',
	styleUrls: ['app/components/salesHistory/salesHistory.css'],
	providers: [Service, DatePipe]
})

export class SalesHistory implements OnInit {

  private getTransactions(): void {
    this.service.getTransactions().subscribe(
      // onNext
      transactions => {
        this.data = transactions;
        this.length = this.data.length;
      },
      // onError
      err => {
        // Log errors if any
        console.log(err);
      },
      // onComplete
      () => {
        this.onChangeTable(this.config);
      });
  }

  public rows:Array<any> = [];
  public columns:Array<any> = [
  	{ 
  		title: 'Transcation Date & Time',
  		name: 'date',
  		sort: 'desc'
  	},
  	{ 
  		title: 'Sales Amount',
  		name: 'amount'
  	},
  	{ 
  		title: 'QooPoints Earned',
  		name: 'points'
  	},
    { 
      title: 'Reference #',
      name: 'reference'
    },
  	{ 
  		title: 'Member',
  		name: 'member',
  		filtering: {
  			filterString: '',
  			placeholder: 'Filter by member'
  		}
  	},
  	{ 
  		title: 'Card #',
  		name: 'card'
  	},
  	{ 
  		title: 'Points Source',
  		name: 'source'
  	}
  ];
  public page:number = 1;
  public itemsPerPage:number = 10;
  public maxSize:number = 5;
  public numPages:number = 1;
  public length:number = 0;

  public config:any = {
    paging: true,
    sorting: {columns: this.columns},
    filtering: {filterString: ''},
    className: ['table-style','table-hover','table-bordered']
  };

  private data: Transaction[];

  public constructor(private dataPipe: DatePipe, private service: Service) {}

  public ngOnInit():void {
  	this.getTransactions();
  }

  public parseData(data:any):any {

  	let parsedData:Array<any> = data;
  	for (var d of parsedData) {
  		d.date = this.dataPipe.transform(d.date, 'short');
  		d.amount = '$' + d.amount;
  	}

  	return data;
  }

  public changePage(page:any, data:Array<any> = this.data):Array<any> {
    let start = (page.page - 1) * page.itemsPerPage;
    let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
    return data.slice(start, end);
  }

  public changeSort(data:any, config:any):any {
    if (!config.sorting) {
      return data;
    }

    let columns = this.config.sorting.columns || [];
    let columnName:string = void 0;
    let sort:string = void 0;

    for (let i = 0; i < columns.length; i++) {
      if (columns[i].sort !== '' && columns[i].sort !== false) {
        columnName = columns[i].name;
        sort = columns[i].sort;
      }
    }

    if (!columnName) {
      return data;
    }

    // simple sorting
    return data.sort((previous:any, current:any) => {

      if (columnName === 'date') {
      	if (previous[columnName].valueOf() > current[columnName].valueOf()) {
	        return sort === 'desc' ? -1 : 1;
	    } else if (previous[columnName].valueOf() < current[columnName].valueOf()) {
	        return sort === 'asc' ? -1 : 1;
	    }
      } else {
	      if (previous[columnName] > current[columnName]) {
	        return sort === 'desc' ? -1 : 1;
	      } else if (previous[columnName] < current[columnName]) {
	        return sort === 'asc' ? -1 : 1;
	      }
	  }
      return 0;
    });
  }

  public changeFilter(data:any, config:any):any {
    let filteredData:Array<any> = data;
    this.columns.forEach((column:any) => {
      if (column.filtering) {
        filteredData = filteredData.filter((item:any) => {
          return item[column.name].match(column.filtering.filterString);
        });
      }
    });

    if (!config.filtering) {
      return filteredData;
    }

    if (config.filtering.columnName) {
      return filteredData.filter((item:any) =>
        item[config.filtering.columnName].match(this.config.filtering.filterString));
    }

    let tempArray:Array<any> = [];
    filteredData.forEach((item:any) => {
      let flag = false;
      this.columns.forEach((column:any) => {
        // Check to make sure value is not null first or else .toString() will throw an error
        if (item[column.name]) {
          if (item[column.name].toString().match(this.config.filtering.filterString)) {
            flag = true;
          }
        }
      });
      if (flag) {
        tempArray.push(item);
      }
    });
    filteredData = tempArray;

    return filteredData;
  }

  public onChangeTable(config:any, page:any = {page: this.page, itemsPerPage: this.itemsPerPage}):any {
    if (config.filtering) {
      Object.assign(this.config.filtering, config.filtering);
    }

    if (config.sorting) {
      Object.assign(this.config.sorting, config.sorting);
    }

    let filteredData = this.changeFilter(this.data, this.config);
    let sortedData = this.changeSort(filteredData, this.config);
    // sortedData = this.parseData(sortedData);
    // console.log(this.data);
    this.rows = page && config.paging ? this.changePage(page, sortedData) : sortedData;
    this.length = sortedData.length;
  }

  public onCellClick(data: any): any {
    console.log(data);
  }
}