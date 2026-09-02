function outside(e){
          if(e.target===btn || btn.contains(e.target))return;
          if(menu.contains(e.target))return;
          closeMenu();
        }
